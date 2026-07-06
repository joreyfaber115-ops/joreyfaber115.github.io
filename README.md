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
Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app
and publishes it to GitHub Pages. One-time setup: in the repo, go to
**Settings → Pages → Build and deployment → Source → GitHub Actions**.

## Data
- Curated modes: `src/data/players.js` (~177 players, tiered by fame) and the
  alias table for fuzzy matching.
- Live mode: `src/data/rosters.js` fetches team rosters from ESPN. If ESPN is
  unreachable, the game falls back to the curated list.
