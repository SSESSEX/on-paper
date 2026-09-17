export type CommitmentKey =
  | 'team'
  | 'manager'
  | 'start'
  | 'headcount'
  | 'process'
  | 'ownership'
  | 'pay';

export type CommitmentStatus = 'confirmed' | 'absent' | 'unverified';

export type VerdictBand = 'VAGUE' | 'PARTIAL' | 'CONCRETE';

export interface CommitmentDefinition {
  key: CommitmentKey;
  label: string;
  absencePhrase: string;
  counts: string;
  doesNotCount: string;
}

export interface RawCommitment {
  stated: boolean;
  quote: string;
}

export type RawModelOutput = Record<CommitmentKey, RawCommitment>;

export interface RawMultiModelOutputItem extends RawModelOutput {
  index: number;
}

export interface EvaluatedCommitment {
  key: CommitmentKey;
  label: string;
  absencePhrase: string;
  stated: boolean;
  quote: string;
  status: CommitmentStatus;
  unverifiedNote?: string;
}

export interface AdvertAnalysis {
  id: string;
  title: string;
  employer: string;
  advert: string;
  commitments: EvaluatedCommitment[];
  confirmedCount: number;
  unverifiedCount: number;
  absentCount: number;
  band: VerdictBand;
  verdictSentence: string;
  modelId: string;
}

export interface RewriteResult {
  rewrittenText: string;
  missingKeys: CommitmentKey[];
}
