# Name The College 🏈

Guess where each NFL player went to college. A React (Vite) game with a
scouting-report theme, deployed to GitHub Pages at
https://joreyfaber115.github.io

## Game modes
- **Rookie Camp** — biggest household names only.
- **Starting Lineup** — stars and standouts across every era since 1980.
- **Deep Draft** — role players and deep cuts. Brutal.
- **Current Rosters** — live active players pulled from ESPN's public API.

Type your answer — abbreviations and common nicknames are accepted
("USC", "Ole Miss", "The Ohio State University" all work), and small typos
are forgiven. Hints cost points; streaks earn bonuses. Best scores are saved
locally per mode.

## Develop
```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Deploy

The site is a single self-contained `index.html` at the repo root (all JS and CSS
inlined). GitHub Pages serves it directly — no build step. Setup: **Settings →
Pages → Source → Deploy from a branch → main → / (root)**.

To edit the app, change the React source in `src/`, then rebuild the single file:
```bash
npm install
npm run build          # outputs dist/index.dev.html
cp dist/index.dev.html index.html
```
