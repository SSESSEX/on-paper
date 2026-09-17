# On Paper

> what this advert actually commits to

A job advert is a document. It makes some commitments and avoids others.

You read one and come away with an impression. On Paper replaces the impression
with a list: seven specific things a real vacancy states, each one quoting the
exact sentence that proves it.

> They said what the team is, when you'd start, and how they'll decide.
> They did not say what you'd own, how many they're hiring, or what it pays.

It does not judge the employer, guess intent, or predict anything. It reads a
document and reports what is in it.

## The seven commitments

| | counts | doesn't |
|---|---|---|
| The team you'd join | a named team or function | the company's own name |
| Who you'd answer to | a named role you report to | "work with stakeholders" |
| When you'd start | a date, month or intake | "immediate start" |
| How many they're hiring | an actual number | "multiple roles" |
| How they'll decide | the hiring stages | "we'll be in touch" |
| What you'd own | a deliverable this role owns | duties that fit any job |
| What it pays | a figure or a range | "competitive", "DOE" |

Seven confirmed reads **Concrete**. Three or four, **Partial**. Two or fewer,
**Vague**.

## The rule that makes it trustworthy

**A quote that isn't in the advert doesn't count.**

Models paraphrase. One that tidies *"reporting into the Head of Data Platform"*
down to *"reports to Head of Data"* has handed you a quote you cannot highlight
and cannot defend. So every quote is checked back against the pasted text, and
anything not found there is marked unverified and scored as **not stated**.

That can only lower a result, never raise one — the safe direction. The count of
unverified quotes is shown in the UI, because a model that is confabulating is
something you deserve to know before trusting the rest of what it said.

## Status

**Spec only.** The app is not built yet.

[`BUILD_PROMPT.md`](BUILD_PROMPT.md) is the complete specification — the model
contract, the prompt, the response schema, the verification rule, every UI
state, and nine acceptance checks. Paste it into Google AI Studio or a coding
agent to generate the app.

Started at a Google DeepMind × Corgi builder event in London. Not affiliated
with, or endorsed by, either.

## Running it

Once the app exists: open `index.html`, paste an advert, press **Read it**.

It needs a Gemini API key from [AI Studio](https://aistudio.google.com/apikey).
Put it in `.env` — already gitignored, and that file exists so a key can never
land in the history by accident.

The key is used directly from the browser, which is fine for a local demo and
is not something to deploy publicly as-is.
