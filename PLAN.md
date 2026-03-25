# Lighthouse Autoresearch — Implementation Plan

## Context

We're applying Karpathy's autoresearch methodology to web performance optimization. Instead of a neural network, our "model" is a landing page. Instead of val_bpb, our metric is Lighthouse composite score. The goal is to learn web performance fundamentals through iterative experimentation.

## Phase 1: Setup (Baseline)

### 1.1 Create the deliberately bad landing page

Build `index.html`, `styles.css`, `script.js` with common anti-patterns:

**Performance sins:**
- Render-blocking CSS (large stylesheet in `<head>` with unused rules)
- Render-blocking JS (synchronous `<script>` tags in `<head>`)
- Unoptimized images (large PNGs where JPG/WebP would do, no width/height attributes)
- No lazy loading
- Excessive DOM depth
- Unused CSS (~70% of rules don't match anything)
- No caching headers consideration
- Layout shifts (images without dimensions, dynamically injected content)

**Accessibility sins:**
- Missing alt text on images
- Poor color contrast (light gray text on white background)
- No semantic HTML (divs everywhere, no landmarks)
- Missing lang attribute
- No skip-to-content link
- Form inputs without labels
- Tiny click targets

**SEO sins:**
- Missing meta description
- No structured heading hierarchy (jumping from h1 to h4)
- Missing Open Graph tags
- No canonical URL

**Best Practices sins:**
- Console errors (referencing undefined vars)
- HTTP links to images (mixed content pattern)
- No doctype or charset issues

### 1.2 Set up serving and measurement

- Serve with `npx serve` or `python -m http.server`
- Verify Lighthouse can run against it (CLI: `npx lighthouse http://localhost:PORT --output=json`)
- Parse JSON output to extract the 4 category scores
- Create a small `measure.sh` or `measure.py` script that runs Lighthouse and outputs scores

### 1.3 Initialize git and results tracking

- `git init`, commit baseline
- Create `results.tsv` with header row
- Run baseline measurement and log first entry

## Phase 2: Experiment Loop

Experiments roughly ordered from highest-impact to lowest. The agent proposes, user approves, we run and learn.

**Expected experiment categories (not exhaustive):**

1. **Quick wins** — defer JS, async CSS, add meta viewport, add doctype
2. **Image optimization** — proper formats, dimensions, lazy loading
3. **CSS cleanup** — remove unused rules, inline critical CSS
4. **Semantic HTML** — replace divs with landmarks, proper headings
5. **Accessibility** — contrast fixes, alt text, labels, focus management
6. **SEO** — meta tags, structured data, heading hierarchy
7. **JS optimization** — remove blocking scripts, defer/async
8. **Fine-tuning** — font loading strategies, preconnect hints, CLS fixes

Each experiment: propose → approve → change → measure → explain → keep/discard.

## Phase 3: Review & Learn

After reaching 90+ composite score:
- Review the full results.tsv progression
- Summarize the top 5 most impactful changes
- Discuss what surprised us
- Consider: what would change if this were a Next.js app?

## Verification

- Lighthouse scores are reproducible (run same page 3x, scores within ±2 points)
- Each kept commit represents a real improvement
- results.tsv matches git log (every kept experiment has a commit)
- Final page is a functional, good-looking landing page (not a gutted skeleton)
