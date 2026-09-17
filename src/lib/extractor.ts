import {
  COMMITMENT_DEFINITIONS,
  DEFAULT_MODEL_ID,
} from '../constants';
import {
  AdvertAnalysis,
  CommitmentKey,
  CommitmentStatus,
  EvaluatedCommitment,
  RawCommitment,
  RawModelOutput,
  RawMultiModelOutputItem,
  VerdictBand,
} from '../types';

/**
 * Normalise text according to Section 5 of the spec:
 * - replace curly quotes ' ' " " with straight ' and "
 * - replace en dash, em dash, minus, non-breaking hyphen with -
 * - replace non-breaking and thin spaces with a normal space
 * - collapse all whitespace runs to one space
 * - trim
 * - lowercase
 */
export function normalise(s: string): string {
  if (!s) return '';
  return s
    // Curly quotes
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    // Dashes & hyphens (en dash, em dash, minus sign, non-breaking hyphen, figure dash, horizontal bar)
    .replace(/[\u2013\u2014\u2212\u2011\u2012\u2015]/g, '-')
    // Non-breaking & thin/unusual whitespace
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Tolerant JSON parser per Section 4.4:
 * 1. Trim
 * 2. If it starts with a code fence, strip fence and language tag
 * 3. JSON.parse
 * 4. If that throws, take substring from first { or [ to last } or ] and parse that
 * 5. If that throws, throw descriptive error
 */
export function parseModelJson<T = unknown>(rawText: string, preferArray = false): T {
  let text = rawText.trim();

  // Strip markdown code fences
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    return JSON.parse(text) as T;
  } catch (_e1) {
    const startChar = preferArray ? '[' : '{';
    const endChar = preferArray ? ']' : '}';

    const firstIndex = text.indexOf(startChar);
    const lastIndex = text.lastIndexOf(endChar);

    if (firstIndex !== -1 && lastIndex !== -1 && lastIndex > firstIndex) {
      const extracted = text.substring(firstIndex, lastIndex + 1);
      try {
        return JSON.parse(extracted) as T;
      } catch (_e2) {
        // Fall through to error
      }
    }

    throw new Error("The model didn't return readable JSON. Try again.");
  }
}

/**
 * Generates the headline verdict sentence naming top 3 absences in table order
 */
export function generateVerdictSentence(
  confirmedCount: number,
  absentOrUnverifiedCommitments: EvaluatedCommitment[]
): string {
  if (confirmedCount === 7) {
    return 'Commits to all 7 commitments in writing.';
  }

  const missingPhrases = absentOrUnverifiedCommitments.map((c) => c.absencePhrase);

  if (missingPhrases.length === 0) {
    return `Commits to ${confirmedCount} of 7.`;
  }

  const topMissing = missingPhrases.slice(0, 3);
  let absencesList = '';

  if (topMissing.length === 1) {
    absencesList = topMissing[0];
  } else if (topMissing.length === 2) {
    absencesList = `${topMissing[0]} or ${topMissing[1]}`;
  } else {
    absencesList = `${topMissing[0]}, ${topMissing[1]}, or ${topMissing[2]}`;
  }

  return `Commits to ${confirmedCount} of 7 — doesn't say ${absencesList}.`;
}

/**
 * Computes Verdict Band from confirmed count:
 * 0–2 → VAGUE
 * 3–4 → PARTIAL
 * 5–7 → CONCRETE
 */
export function computeBand(confirmedCount: number): VerdictBand {
  if (confirmedCount >= 5) return 'CONCRETE';
  if (confirmedCount >= 3) return 'PARTIAL';
  return 'VAGUE';
}

/**
 * Verifies raw model output against the original advert text
 */
export function verifyAndScoreAdvert(
  id: string,
  title: string,
  employer: string,
  advert: string,
  rawOutput: RawModelOutput,
  modelId = DEFAULT_MODEL_ID
): AdvertAnalysis {
  const normalisedAdvert = normalise(advert);

  const evaluatedCommitments: EvaluatedCommitment[] = [];
  let confirmedCount = 0;
  let unverifiedCount = 0;
  let absentCount = 0;

  for (const def of COMMITMENT_DEFINITIONS) {
    const raw: RawCommitment | undefined = rawOutput[def.key];
    const stated = Boolean(raw?.stated);
    const quote = (raw?.quote || '').trim();

    let status: CommitmentStatus = 'absent';
    let unverifiedNote: string | undefined;

    if (!stated) {
      status = 'absent';
      absentCount++;
    } else if (!quote) {
      status = 'unverified';
      unverifiedNote = "the model quoted something that isn't in the advert";
      unverifiedCount++;
    } else {
      const normalisedQuote = normalise(quote);
      if (normalisedQuote.length > 0 && normalisedAdvert.includes(normalisedQuote)) {
        status = 'confirmed';
        confirmedCount++;
      } else {
        status = 'unverified';
        unverifiedNote = "the model quoted something that isn't in the advert";
        unverifiedCount++;
      }
    }

    evaluatedCommitments.push({
      key: def.key,
      label: def.label,
      absencePhrase: def.absencePhrase,
      stated,
      quote,
      status,
      unverifiedNote,
    });
  }

  const band = computeBand(confirmedCount);
  const absentOrUnverified = evaluatedCommitments.filter((c) => c.status !== 'confirmed');
  const verdictSentence = generateVerdictSentence(confirmedCount, absentOrUnverified);

  return {
    id,
    title,
    employer,
    advert,
    commitments: evaluatedCommitments,
    confirmedCount,
    unverifiedCount,
    absentCount,
    band,
    verdictSentence,
    modelId,
  };
}

/**
 * Multi-advert parser helper: detects if text contains "---" dividers
 */
export interface ParsedAdvertChunk {
  index: number;
  title: string;
  employer: string;
  advert: string;
}

export function parseAdvertChunks(input: string): ParsedAdvertChunk[] {
  // Split on a line containing only dashes (at least three dashes)
  const regex = /(?:^|\n)\s*---+\s*(?:\n|$)/g;
  const parts = input.split(regex).map((p) => p.trim()).filter(Boolean);

  if (parts.length <= 1) {
    return [
      {
        index: 0,
        title: '',
        employer: '',
        advert: input.trim(),
      },
    ];
  }

  return parts.map((part, index) => {
    let title = '';
    let employer = '';
    let advert = part;

    // Check for "Title:" and "Employer:" headers if user formatted them that way
    const titleMatch = part.match(/(?:^|\n)Title:\s*([^\n]+)/i);
    const employerMatch = part.match(/(?:^|\n)Employer:\s*([^\n]+)/i);

    if (titleMatch) {
      title = titleMatch[1].trim();
      advert = advert.replace(titleMatch[0], '');
    }
    if (employerMatch) {
      employer = employerMatch[1].trim();
      advert = advert.replace(employerMatch[0], '');
    }

    // Clean up any remaining leading "Advert:" tag
    advert = advert.replace(/(?:^|\n)Advert:\s*/i, '').trim();

    return {
      index,
      title: title || `Advert #${index + 1}`,
      employer: employer || 'Unknown Employer',
      advert: advert || part,
    };
  });
}
