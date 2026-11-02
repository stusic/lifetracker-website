# LifeTracker website

The public marketing/informational site for LifeTracker (a DayZ server-side mod). Static site — plain HTML/CSS/JS, no build step, no backend, no dependency on the live LifeTracker API or database. If the backend or GitHub itself is down, this site still works.

## Structure

- `index.html` — the single page, all sections.
- `css/tokens.css` — design tokens (colors, fonts, spacing) shared with the approved LifeTracker visual language (`docs/vision/EXPERIENCE.md` in the main project repo).
- `css/styles.css` — all layout/component styles.
- `js/main.js` — loads the JSON content files and renders features/roadmap/FAQ/links, plus the sample-journey demo.
- `data/*.json` — editable content. Update these without touching HTML/CSS:
  - `features.json` — feature list + status (`available` / `planned` / `under-consideration`).
  - `roadmap.json` — roadmap categories and items.
  - `faq.json` — FAQ entries.
  - `links.json` — project links (GitHub, Workshop, contact). Flip `"available": true` and fill in `href` once each resource is real.
  - `demo-journey.json` — the illustrative sample-journey data shown in the Demo section. **Deliberately not real DayZ map imagery or a real player's record** — see the note below.

## Why the demo map is a stylized illustration, not the real Chernarus map

The project's real map viewer uses Bohemia Interactive's Chernarus satellite imagery under a narrow, owner-approved exception for a specific licensing review (`DEC-005`/`DEC-015` in the main project's `docs/vision/DECISIONS.md`) — it is explicitly **not** cleared for general public distribution until Bohemia Interactive licensing is resolved. This site draws its own simple SVG illustration instead, so it never needs that imagery or any dependency on the real backend. Don't swap in the real map image or a real record link here until that licensing question is resolved and a deliberate decision is made to do so.

## Updating content

Edit the relevant `data/*.json` file and redeploy (push to `main` — GitHub Actions publishes automatically). No rebuild step needed.

## Local preview

Any static file server works, e.g.:

```
npx serve .
```

or Python's built-in server:

```
python -m http.server 8080
```

Opening `index.html` directly via `file://` also works for a quick look, but a local server is more representative (and required if you ever add fetch-based content loading that's picky about `file://` origins in some browsers).

## Deployment

This repo is configured for GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) — it builds nothing, just publishes the static files on every push to `main`. In the repo's Settings → Pages, set the source to "GitHub Actions" (not "Deploy from a branch").

### Custom domain

To use a custom domain, add a `CNAME` file at the repo root containing just the domain, and configure DNS per GitHub's custom-domain docs. Not set up yet.
