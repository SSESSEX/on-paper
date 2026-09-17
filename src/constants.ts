import { CommitmentDefinition } from './types';

export const DEFAULT_MODEL_ID = 'gemini-3.5-flash';

export const COMMITMENT_DEFINITIONS: CommitmentDefinition[] = [
  {
    key: 'team',
    label: "The team you'd join",
    absencePhrase: "the team you'd join",
    counts: 'a named team, function or department',
    doesNotCount: "the company's own name",
  },
  {
    key: 'manager',
    label: "Who you'd answer to",
    absencePhrase: "who you'd answer to",
    counts: 'a named role or person you report to',
    doesNotCount: '"work with stakeholders"',
  },
  {
    key: 'start',
    label: "When you'd start",
    absencePhrase: "when you'd start",
    counts: 'a date, month or intake',
    doesNotCount: '"immediate start" — names no date',
  },
  {
    key: 'headcount',
    label: "How many they're hiring",
    absencePhrase: "how many they're hiring",
    counts: 'an actual number',
    doesNotCount: '"multiple roles", "ongoing"',
  },
  {
    key: 'process',
    label: "How they'll decide",
    absencePhrase: "how they'll decide",
    counts: 'the hiring stages',
    doesNotCount: '"we\'ll be in touch"',
  },
  {
    key: 'ownership',
    label: "What you'd own",
    absencePhrase: "what you'd own",
    counts: 'a deliverable, system or process this role owns',
    doesNotCount: 'duties that fit any job in the field',
  },
  {
    key: 'pay',
    label: "What it pays",
    absencePhrase: "what it pays",
    counts: 'a number or a range',
    doesNotCount: '"competitive", "DOE", "negotiable"',
  },
];

export const SYSTEM_INSTRUCTION = `You extract facts from job adverts. You do not judge them.

For each of the seven fields, decide whether the advert STATES it, and copy the
exact words that state it. If the advert does not state it, set stated to false
and quote to "".

team       The specific team, function or department the hire joins.
           Counts: "you join the Plant Analytics team".
           Does not: the company's own name.

manager    The role this job reports to.
           Counts: "reporting to the Head of Data".
           Does not: "you'll work with stakeholders".

start      A start date, month or intake for this role.
           Counts: "starting January 2027", "September intake".
           Does not: "immediate start", which names no date.

headcount  How many people this advert is hiring.
           Counts: "one position", "two roles", "around 40 graduates".
           Does not: "multiple roles" or "ongoing recruitment".

process    The stages of the hiring process.
           Counts: "a technical exercise, then a panel on 6 October".
           Does not: "a member of our team will be in touch".

ownership  A deliverable, system or process this role owns.
           Counts: "you own the daily yield report the Sheffield line runs on".
           Does not: generic duties that would fit any job in the field.

pay        An actual figure or range.
           Counts: "£38,000–£42,000", "£45k".
           Does not: "competitive salary", "dependent on experience".

Rules:
- Never infer anything from the employer's size, sector or reputation.
- Never repair a partial statement. If the advert is vague, it does not state it.
- quote must appear in the advert exactly. Do not paraphrase, shorten or tidy.
- Output the JSON object only.`;

export const SINGLE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    team: {
      type: 'object',
      properties: {
        stated: { type: 'boolean' },
        quote: { type: 'string' },
      },
      required: ['stated', 'quote'],
    },
    manager: {
      type: 'object',
      properties: {
        stated: { type: 'boolean' },
        quote: { type: 'string' },
      },
      required: ['stated', 'quote'],
    },
    start: {
      type: 'object',
      properties: {
        stated: { type: 'boolean' },
        quote: { type: 'string' },
      },
      required: ['stated', 'quote'],
    },
    headcount: {
      type: 'object',
      properties: {
        stated: { type: 'boolean' },
        quote: { type: 'string' },
      },
      required: ['stated', 'quote'],
    },
    process: {
      type: 'object',
      properties: {
        stated: { type: 'boolean' },
        quote: { type: 'string' },
      },
      required: ['stated', 'quote'],
    },
    ownership: {
      type: 'object',
      properties: {
        stated: { type: 'boolean' },
        quote: { type: 'string' },
      },
      required: ['stated', 'quote'],
    },
    pay: {
      type: 'object',
      properties: {
        stated: { type: 'boolean' },
        quote: { type: 'string' },
      },
      required: ['stated', 'quote'],
    },
  },
  required: ['team', 'manager', 'start', 'headcount', 'process', 'ownership', 'pay'],
};

export const MULTI_RESPONSE_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      index: { type: 'integer' },
      team: {
        type: 'object',
        properties: {
          stated: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['stated', 'quote'],
      },
      manager: {
        type: 'object',
        properties: {
          stated: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['stated', 'quote'],
      },
      start: {
        type: 'object',
        properties: {
          stated: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['stated', 'quote'],
      },
      headcount: {
        type: 'object',
        properties: {
          stated: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['stated', 'quote'],
      },
      process: {
        type: 'object',
        properties: {
          stated: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['stated', 'quote'],
      },
      ownership: {
        type: 'object',
        properties: {
          stated: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['stated', 'quote'],
      },
      pay: {
        type: 'object',
        properties: {
          stated: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['stated', 'quote'],
      },
    },
    required: ['index', 'team', 'manager', 'start', 'headcount', 'process', 'ownership', 'pay'],
  },
};
