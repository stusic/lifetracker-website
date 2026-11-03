# LifeTracker website

The public marketing/informational site for LifeTracker (a DayZ server-side mod). Static site: plain HTML/CSS/JS, no build step, no backend, no runtime dependency on the live LifeTracker API or the GitHub API. If the backend or GitHub itself is down, this site still works — see "Roadmap board" below for the one exception to how that's achieved.

## Structure

- `index.html`: the single page, all sections.
- `css/tokens.css`: design tokens (colors, fonts, spacing) shared with the approved LifeTracker visual language (`docs/vision/EXPERIENCE.md` in the main project repo).
- `css/styles.css`: all layout/component styles.
- `js/main.js`: loads the JSON content files and renders features/roadmap board/FAQ/links.
- `data/*.json`: editable content. Update these without touching HTML/CSS:
  - `features.json`: feature list + status (`available` / `planned` / `under-consideration`).
  - `board.json`: the roadmap board shown in the Roadmap section — generated at deploy time, see below. Don't hand-edit except as a fallback if the generator is broken.
  - `faq.json`: FAQ entries.
  - `links.json`: project links (GitHub, Workshop, Patreon, Discord, Releases). Flip `"available": true` and fill in `href` once each resource is real. `repo` and `workshop` are also rendered as a quick-link row in the Install section (`js/main.js`'s `installQuickLinks`), so updating them here updates both places.

## Roadmap board

The Roadmap section renders `data/board.json`, a compact on-brand board view
of the real public GitHub Project — [LifeTracker Mod
Roadmap](https://github.com/users/stusic/projects/2) on
`stusic/lifetracker-server-side-mod` — instead of a hand-maintained list.

`scripts/fetch-board.js` fetches the live project via GitHub's GraphQL API
and overwrites `data/board.json` **at deploy time only**, as a step in
`.github/workflows/deploy.yml`, before the static files are published. The
deployed site itself never calls the GitHub API — visitors only ever load
the plain JSON file, same as every other `data/*.json` file, which is what
keeps the "still works if GitHub is down" property true for *visitors* even
though the *build* now depends on GitHub being reachable. If the fetch
fails (bad token, GitHub outage, rate limit) the build logs the error and
deploys with whatever `data/board.json` was last committed, rather than
failing the deploy.

The workflow also runs on a schedule (every 6 hours) so the board stays
current even on days with no code pushes.

**Requires a `PROJECTS_TOKEN` repo secret** — a GitHub personal access token
with read access to Projects, since Projects v2 data isn't readable via the
default `GITHUB_TOKEN`. To set it up:

1. Create a token: GitHub → Settings → Developer settings → Personal access
   tokens. A fine-grained token scoped to the `stusic` account with
   **"Projects" → Read-only** access is enough (the board is public, so no
   issue/repo write access is needed). A classic token with the `read:project`
   scope also works.
2. Add it to this repo (`lifetracker-website`) as a secret named
   `PROJECTS_TOKEN`: Settings → Secrets and variables → Actions → New
   repository secret.

Without that secret, deploys still succeed — they just skip refreshing the
board and keep serving the last committed `data/board.json`.

## The Demo section embeds a real, live record

The Demo section (`#demo` in `index.html`) is an `<iframe>` pointed directly at a real, live LifeTracker record on the hosted service (currently `https://dayz-life-tracker-api.onrender.com/<token>`, one of the owner's own real characters), not a mockup, and not the earlier synthetic/illustrative placeholder this section used before.

**This is a deliberate exception, not a quiet reversal, of the general rule elsewhere in this project** that dev-only Chernarus map imagery isn't cleared for general public distribution until Bohemia Interactive licensing is resolved (`DEC-005`/`DEC-015` in the main project's `docs/vision/DECISIONS.md`). Embedding this specific record here was an explicit owner decision for this one link. If that record's link is ever revoked/rotated, or the Bohemia licensing situation changes, this `src` needs a deliberate update; it won't fail loudly, it'll just go blank or 404 inside the frame.

The service is hosted on a free tier that spins down when idle, so the embedded frame can take several seconds to wake up on first load. The `demo-note` paragraph below it says so directly rather than leaving a blank box unexplained.

## Updating content

Edit the relevant `data/*.json` file and redeploy (push to `main`; GitHub Actions publishes automatically). No rebuild step needed.

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

This repo is configured for GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`); it builds nothing, just publishes the static files on every push to `main`. In the repo's Settings > Pages, set the source to "GitHub Actions" (not "Deploy from a branch").

### Custom domain

To use a custom domain, add a `CNAME` file at the repo root containing just the domain, and configure DNS per GitHub's custom-domain docs. Not set up yet.
