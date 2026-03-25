# Lighthouse Autoresearch — Prompt Contract

## GOAL

Optimize a deliberately bad landing page to maximize Lighthouse scores using the autoresearch methodology (hypothesis → experiment → measure → keep/discard → repeat).

**Success looks like:**
- Baseline page starts with Lighthouse scores in the 30-50 range across all categories
- Through iterative experiments, scores reach 90+ in all four categories (Performance, Accessibility, Best Practices, SEO)
- The user understands WHY each change helped or didn't help
- A clear results log shows the progression from bad → good

**Target metric:** Composite Lighthouse score = average of (Performance + Accessibility + Best Practices + SEO), scale 0-100. Higher is better.

## CONSTRAINTS

1. **Stack:** Plain HTML + CSS + JS only. No frameworks, no build steps, no npm packages.
2. **Serving:** Simple local dev server (e.g., `npx serve` or Python's `http.server`)
3. **Measurement:** Lighthouse CLI or Chrome DevTools MCP audit — must produce numeric scores
4. **Experiment loop:** Each experiment must be approved by the user before execution
5. **Learning-first:** Every experiment must include:
   - Plain-English hypothesis (what we're changing and why it should help)
   - The actual diff (what changed in the code)
   - Before/after scores
   - Explanation of the result (why it worked or didn't)
6. **Git tracking:** Each experiment is a commit. Improvements are kept, regressions are reverted.
7. **No external assets:** All resources (images, fonts, etc.) must be local or inlined — no CDN dependencies that could affect score consistency.

## FORMAT

### Project structure
```
lighthouse-autoresearch/
  program.md          # Autoresearch instructions (like Karpathy's)
  index.html          # The page being optimized (agent modifies this)
  styles.css          # Styles (agent modifies this)
  script.js           # JS (agent modifies this)
  assets/             # Local images, fonts, etc.
  results.tsv         # Experiment log
```

### results.tsv format
```
commit	perf	a11y	bp	seo	composite	status	description
a1b2c3d	35	42	58	50	46.3	baseline	deliberately bad starting page
b2c3d4e	52	42	58	50	50.5	keep	inlined critical CSS
```

### Experiment cycle
1. Agent proposes hypothesis with explanation
2. User approves/rejects
3. Agent makes change + commits
4. Agent runs Lighthouse audit
5. Agent reports before/after + explains result
6. User decides keep/discard

## FAILURE CONDITIONS

- **Score regression without explanation** — if a change makes scores worse and the agent can't explain why, that's a bug in the process
- **Black-box changes** — any modification the user doesn't understand means the loop failed its learning objective
- **Framework creep** — introducing build tools, bundlers, or frameworks violates the constraint
- **Metric gaming** — changes that technically improve Lighthouse scores but produce a broken/unusable page (e.g., removing all content, invisible text)
- **Stale baseline** — if the agent compares against the wrong baseline (must always compare against the last kept version)
