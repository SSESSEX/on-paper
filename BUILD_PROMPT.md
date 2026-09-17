# BUILD PROMPT — "On Paper"

Paste everything below the line into Google AI Studio's build flow, or into a
coding agent. It is written to be followed literally.

Before you paste, fill in the one blank: `<MODEL_ID>`. On the night, take the
exact Gemma 4 model id that AI Studio shows you. If Gemma 4 is not yet
selectable, use the newest Gemini model AI Studio offers and swap the id later
— nothing else in the spec changes.

---

You are building a small, complete web app called **On Paper**. Build exactly
what is specified. Do not add features that are not listed. Where this document
gives literal text — a prompt, a schema, a label — use it verbatim.

## 1. What it is

A job advert is a document. It makes some commitments and avoids others.

On Paper reads a job advert and reports **what the employer has actually
committed to in writing** — seven specific commitments — and quotes the exact
sentence behind each one. It does not judge the employer, guess intent, or
predict anything. It reads a document and reports what is in it.

The product insight: a jobseeker reads an advert and comes away with an
impression. On Paper replaces the impression with a list. "They said what the
team is, when you start, and how they'll decide. They did not say what you'd
own, how many they're hiring, or what it pays."

Tagline: **what this advert actually commits to.**

## 2. Hard constraints

- **A single-page web app.** No backend, no database, no login, no scraping, no
  file uploads. The user pastes advert text into a textarea.
- **One external dependency: the Gemini API.** No other network calls.
- Plain HTML + CSS + vanilla JS is fine and preferred. If the build environment
  hands you React, that is also fine. Do not add a state library, a component
  library, or a build step you did not already have.
- **Everything must work offline except the model call.** Verification,
  scoring and rendering are local logic.
- The app must be usable on a laptop screen in a dark room from three metres
  away. Large type, high contrast, no dense tables in Phase 1.

### The API key

Read the key from the environment the build tool provides. If none exists, show
a small settings field where the user pastes one, and keep it in
`sessionStorage` only.

Add this exact note under that field:

> This key is used directly from your browser. Fine for a local demo — do not
> deploy this page publicly with a key in it.

That is true and it is the honest thing to say. Do not build a proxy; just say
it.

## 3. The seven commitments

These are the entire product. Use these exact keys and these exact labels.

| key | label | what counts | what does not |
|---|---|---|---|
| `team` | The team you'd join | a named team, function or department | the company's own name |
| `manager` | Who you'd answer to | a named role or person you report to | "work with stakeholders" |
| `start` | When you'd start | a date, month or intake | "immediate start" — names no date |
| `headcount` | How many they're hiring | an actual number | "multiple roles", "ongoing" |
| `process` | How they'll decide | the hiring stages | "we'll be in touch" |
| `ownership` | What you'd own | a deliverable, system or process this role owns | duties that fit any job in the field |
| `pay` | What it pays | a number or a range | "competitive", "DOE", "negotiable" |

`pay` is the one most jobseekers look for first and the one most often dodged.
It belongs here for the same reason as the rest: it is either stated or it is
not, and that is a fact about the document.

## 4. The model contract

### 4.1 Model config

Model: `<MODEL_ID>`
Temperature: `0`
Max output tokens: `2048`

Temperature is zero because this is extraction, not writing. The same advert
must produce the same answer twice, or the app is not trustworthy.

### 4.2 Structured output

Request this response schema. Use Gemini's structured-output config
(`responseMimeType: "application/json"` plus the response schema field your SDK
version exposes).

```json
{
  "type": "object",
  "properties": {
    "team":      { "$ref": "#/$defs/commitment" },
    "manager":   { "$ref": "#/$defs/commitment" },
    "start":     { "$ref": "#/$defs/commitment" },
    "headcount": { "$ref": "#/$defs/commitment" },
    "process":   { "$ref": "#/$defs/commitment" },
    "ownership": { "$ref": "#/$defs/commitment" },
    "pay":       { "$ref": "#/$defs/commitment" }
  },
  "required": ["team","manager","start","headcount","process","ownership","pay"],
  "$defs": {
    "commitment": {
      "type": "object",
      "properties": {
        "stated": { "type": "boolean" },
        "quote":  { "type": "string" }
      },
      "required": ["stated", "quote"]
    }
  }
}
```

Two notes that will save you time:

- **`quote` is a plain string, never nullable.** Use `""` for absent. Union
  types like `["string","null"]` are handled correctly by some backends and
  quietly mishandled by others.
- **If the model rejects the schema**, do not fight it. Drop the schema, keep
  `responseMimeType: "application/json"`, and rely on the prompt plus the
  tolerant parser in §4.4. Gemma models served through this API do not all
  accept a response schema. The app must work either way.

### 4.3 The prompt

Use this as the system instruction. If the model rejects a separate system
turn, prepend it to the user turn with `\n\n---\n\n` between. Do not reword it.

```
You extract facts from job adverts. You do not judge them.

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
- Output the JSON object only.
```

Each field carries one positive and one negative example on purpose. The
negative example is what stops a model stretching a definition to fit.

The user turn is:

```
Title: <title, or "not stated">
Employer: <employer, or "not stated">

Advert:
<the pasted text>
```

Title and employer are optional inputs. Include them because `team` needs the
company name to reject it.

### 4.4 Tolerant parsing

Write a `parseModelJson(text)` helper. In order:

1. Trim.
2. If it starts with a code fence, strip the fence and any language tag.
3. `JSON.parse`.
4. If that throws, take the substring from the first `{` to the last `}` and
   parse that.
5. If that throws, surface the error to the UI (§7). Never crash.

## 5. Verification — the rule that makes this trustworthy

**A quote that is not in the advert does not count.**

Models paraphrase. A model that tidies "reporting into the Head of Data
Platform" down to "reports to Head of Data" has handed you a quote you cannot
highlight and cannot defend.

After parsing, check every quote back against the pasted text:

```
normalise(s):
  replace curly quotes ' ' " " with straight ' and "
  replace en dash, em dash, minus, non-breaking hyphen with -
  replace non-breaking and thin spaces with a normal space
  collapse all whitespace runs to one space
  trim
  lowercase
```

Then for each field, assign a status:

- `stated: false` → **`absent`**
- `stated: true` but `quote` is empty → **`unverified`**
- `stated: true` and `normalise(quote)` is a substring of `normalise(advert)` → **`confirmed`**
- `stated: true` and it is not → **`unverified`**

**Only `confirmed` counts toward the score.** `unverified` counts as not
stated. This can only lower a result, never raise one, which is the safe
direction.

Show the unverified count in the UI (§6.4). If it is high, the model is
confabulating and the user deserves to know that before trusting the rest.

## 6. The app

### 6.1 Input screen

- Large textarea, placeholder: `Paste the whole job advert here.`
- Two small optional inputs above it: `Job title` and `Employer`.
- One primary button: **Read it**.
- Disable the button when the advert is under 200 characters, and show:
  `Too short to read — paste the full advert.` A two-line snippet cannot answer
  seven questions about itself, and answering "not stated" seven times over one
  would be technically true and badly misleading.
- Include a **Try an example** link that loads a realistic advert into the
  textarea. Write two examples yourself: one concrete advert that scores well,
  one vague pipeline-style advert that scores badly. Invent the employer names.
  Do not use real companies.

### 6.2 Result screen — the headline

A single large verdict block:

- Count of `confirmed` commitments out of 7.
- A band label, from the count:
  - `0–2` → **VAGUE**
  - `3–4` → **PARTIAL**
  - `5–7` → **CONCRETE**
- One generated sentence naming the top three absences, in the table order of
  §3. Example: `Commits to 3 of 7 — doesn't say who you'd answer to, how many
  they're hiring, or what it pays.`

Generate that sentence in your own code from the missing keys. Do not ask the
model for it. Deterministic, instant, free, and consistent across runs.

### 6.3 Result screen — the seven rows

One row per commitment, in the table order of §3:

- A tick for `confirmed`, a cross for `absent`, a question mark for `unverified`.
- The label from §3.
- For `confirmed`: the quote, in quotation marks, visually distinct from the
  app's own text.
- For `absent`: `not stated`.
- For `unverified`: `the model quoted something that isn't in the advert` —
  and show what it quoted, so the user can see the failure for themselves.

Clicking a confirmed row scrolls the advert text below and highlights that
quote in place. This is the detail that makes people believe the app: the
evidence is in the document, not in the model's word.

### 6.4 Result screen — the footer

One quiet line: `<model id> · <n> quotes verified · <m> not found in the advert`.

### 6.5 Look

Dark ground, one accent per state, no gradients, no emoji. Pick a display
typeface with some character and a plain one for body text — not Inter, not
Roboto, not Arial. Ticks and crosses are inline SVG, not emoji, not icon fonts.
Every interactive thing is a real `<button>` or `<a href>`. Touch targets at
least 44px.

## 7. Failure handling

Every one of these renders as a calm message in the result area. None of them
throws an unhandled error, and none of them clears the pasted advert.

| what happened | what the user sees |
|---|---|
| no API key | `Add an API key to read adverts.` plus the settings field |
| 401 / 403 | `That API key was rejected.` |
| 429 | `Rate limited — wait a moment and try again.` |
| network failure | `Couldn't reach the model. Check your connection.` |
| unparseable response | `The model didn't return readable JSON. Try again.` |
| any other error | `Something went wrong reading that advert.` plus the status code |

Show a loading state on the button while a request is in flight and never allow
two in flight at once.

## 8. Build order — and where to stop

Build in this order. **Each phase must work before you start the next.**

**Phase 1 — the whole product.** One advert in, seven rows and a verdict out,
with verification and quote highlighting. If you only ship this, you have
shipped the idea.

**Phase 2 — the shortlist.** This is the demo moment, and it is the reason this
app is built on a hosted long-context model rather than a local one.

Let the user paste **several adverts at once**, separated by a line containing
only `---`. Send all of them in **one request**, with the schema wrapped in an
array and each item carrying an `index`. Render a comparison table: one row per
advert, seven columns of tick/cross, count and band at the end. Sort by count
descending, so the advert that commits to most rises to the top.

Say the number out loud in the UI: `7 adverts · 1 request`.

That contrast is the point. Reading one advert is a feature. Ranking your whole
shortlist in a single call is the product.

**Phase 3 — only if Phase 2 is solid.** A **Rewrite** button on a VAGUE result
that asks the model to produce the same advert with a bracketed `[STATE THE
TEAM]`-style placeholder inserted at each absence — the advert as it would need
to look to be honest. Same model, second call, a different prompt.

## 9. Do not build

Named explicitly, because each of these has eaten a hackathon before:
URL fetching or scraping; a browser extension; accounts or saved history; a
database; PDF or DOCX parsing; a backend proxy; a chart of any kind; streaming
token-by-token output; multi-language support; a settings page beyond the single
API-key field.

## 10. Acceptance checks

Before calling it done, verify each of these by hand:

1. A concrete advert stating all seven scores **7 of 7, CONCRETE**.
2. A pipeline advert ("building a pipeline of candidates for future
   opportunities", "a member of our team will be in touch when a suitable
   project arises") scores **0 or 1, VAGUE**.
3. Editing a confirmed quote out of the advert and re-running moves that row
   from `confirmed` to `absent`.
4. Hand-editing the parsed response so one quote reads `we will paraphrase
   this` marks that row `unverified` and **lowers** the count.
5. An advert of 150 characters disables the button with the short-advert message.
6. Pasting a wrong API key renders the 401 message, not a blank screen.
7. Clicking a confirmed row highlights that exact text in the advert below.
8. Running the same advert twice gives identical output.
9. Phase 2 only: five adverts separated by `---` produce five table rows from
   one network request. Verify the single request in the network tab.

## 11. Ninety-second demo path

Build so this specific path is smooth:

1. **Try an example** → the vague advert loads → **Read it** → `1 of 7, VAGUE`.
2. Point at the one confirmed row. Click it. The quote highlights in the advert.
3. Load the concrete advert → **Read it** → `7 of 7, CONCRETE`.
4. Paste the shortlist → **Read it** → the table fills. Say: *seven adverts,
   one request.*
5. Close on the footer line: *every one of those quotes was checked back
   against the advert. The ones it couldn't find don't count.*
