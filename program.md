# Lighthouse Autoresearch

You are an autonomous web researcher. Your job is to improve a landing page's Lighthouse scores through iterative experiments.

## Setup

1. **Create a branch**: `git checkout -b autoresearch/<tag>` (propose a tag based on today's date, e.g. `mar25`).
2. **Read the in-scope files**: Read these files for full context:
   - `index.html` — the page you modify.
   - `styles.css` — the stylesheet you modify.
   - `script.js` — the JavaScript you modify.
3. **Start a local HTTP server**: Lighthouse requires HTTP, not file:// URLs. Run `python -m http.server 3456` (or similar) in the background. Verify it stays running. The page will be at `http://localhost:3456`.
4. **Open the page in Chrome**: Use Chrome DevTools MCP `navigate_page` to go to `http://localhost:3456`. Take a screenshot to confirm the page loads.
5. **Initialize results.tsv**: Create `results.tsv` with just the header row. The baseline will be recorded after the first audit.
6. **Confirm and go**: Confirm setup looks good with the user.

Once you get confirmation, kick off the experimentation.

## Experimentation

Each experiment modifies the landing page and measures the result using Lighthouse via Chrome DevTools MCP.

**What you CAN do:**
- Modify `index.html`, `styles.css`, and `script.js`. These are the only files you edit.
- Add, remove, or replace files in `assets/`.
- Everything is fair game: HTML structure, CSS, JavaScript, images, meta tags, accessibility, semantics, performance.

**What you CANNOT do:**
- Modify `program.md`. It is read-only.
- Install packages or add build tools. This is plain HTML/CSS/JS with no build step.
- Use any external CDN, API, or hosted resource. Everything must be local.

**The goal is simple: get the highest composite Lighthouse score.** The composite score is the average of Accessibility, Best Practices, and SEO (each 0-100). Performance is excluded — the `lighthouse_audit` MCP tool does not return a performance score, and localhost performance is near-perfect anyway.

**Simplicity criterion**: All else being equal, simpler is better. A small improvement that adds ugly complexity is not worth it. Clean, readable code that scores well is the goal.

## Measurement

You MUST use Chrome DevTools MCP for all measurement. This is how you see the page and evaluate it:

1. **Ensure the HTTP server is running**: The page must be served over HTTP at `http://localhost:3456`. If the server died, restart it with `python -m http.server 3456` in the background before proceeding.
2. **Navigate to the page**: Use `navigate_page` to load `http://localhost:3456` in Chrome. After making code changes, always reload/navigate again before auditing.
3. **Take a screenshot**: Use `take_screenshot` to visually inspect the page before and after changes.
4. **Run Lighthouse audit**: Use `lighthouse_audit` on `http://localhost:3456` to get scores for Accessibility, Best Practices, and SEO. Performance is not available through this tool — that's expected, ignore it.
5. **Inspect specific issues**: Use `evaluate_script`, `take_snapshot`, or other DevTools tools to investigate specific problems Lighthouse flags.

Do NOT use CLI tools, headless scripts, or any measurement method the user cannot see. The user wants to watch what you're doing through Chrome.

## Output format

After each Lighthouse audit, report scores like this:

```
===== LIGHTHOUSE SCORES =====
accessibility:  XX
best-practices: XX
seo:            XX
composite:      XX.X
=============================
```

## Logging results

Log every experiment to `results.tsv` (tab-separated, NOT comma-separated).

The TSV has a header row and 6 columns:

```
commit	a11y	bp	seo	composite	status	description
```

1. git commit hash (short, 7 chars)
2. accessibility score (0-100)
3. best-practices score (0-100)
4. seo score (0-100)
5. composite (average of the three, one decimal)
6. status: `baseline`, `keep`, or `discard`
7. short text description of what this experiment tried

Example:

```
commit	a11y	bp	seo	composite	status	description
a1b2c3d	42	78	67	62.3	baseline	initial page state
b2c3d4e	58	78	82	72.7	keep	added meta viewport and lang attribute
c3d4e5f	55	71	82	69.3	discard	switched all fonts to Arial
```

## The experiment loop

Every experiment is committed and pushed to GitHub so the full history is visible. There are no reverts — discarded experiments stay in the history, labeled clearly.

LOOP:

1. Look at the page: take a screenshot and run a Lighthouse audit to understand the current state.
2. Propose a hypothesis: explain what you want to change and why you think it will improve scores. **Wait for user approval before proceeding.**
3. Make the change to the code.
4. `git commit` the change with a descriptive message prefixed with `[EXPERIMENT]`.
5. Reload the page in Chrome and run a new Lighthouse audit.
6. Report before/after scores and explain the result — why did it help or not?
7. **Ask the user**: keep or discard?
8. If **keep**: commit a small update to the commit message or leave as-is. This becomes the new baseline. Then `git push`.
9. If **discard**: revert the code back to the previous baseline state and commit the revert with a message like `[DISCARD] revert: <description>`. Then `git push`. The original experiment commit AND the revert commit both stay in history.
10. Log the result in `results.tsv` (do NOT commit results.tsv, leave it untracked).
11. Go to step 1.

**Commit message format:**
- Baseline: `[BASELINE] initial page state`
- Kept experiments: `[KEEP] added semantic HTML landmarks`
- Experiment (before decision): `[EXPERIMENT] replaced table layout with flexbox`
- Discarded reverts: `[DISCARD] revert: replaced table layout with flexbox`

This way anyone browsing the GitHub commit history can see every experiment, what worked, and what didn't.

## Important rules

- **Always explain your reasoning.** Before each experiment, explain what you're changing and why in plain English. After each experiment, explain why the scores changed. The user is learning web development through this process.
- **One change at a time.** Each experiment should test ONE idea. Don't bundle multiple changes — it makes it impossible to know what helped.
- **Wait for approval.** Unlike Karpathy's overnight autonomous loop, this loop requires user approval at steps 2 and 7. Do not skip ahead.
- **Use Chrome DevTools MCP for everything.** The user wants to see the page through the browser, not through CLI output.
- **The baseline ratchets forward.** When an experiment is kept, it becomes the new baseline. Always compare against the most recent kept version, not the original.
- **Push after every experiment.** Every commit (kept or discarded) gets pushed to GitHub so the full experiment history is preserved remotely.
