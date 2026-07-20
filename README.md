# Name The College 🏈

Guess where each NFL player went to college. A React (Vite) game with a
scouting-report theme, deployed to GitHub Pages at
https://joreyfaber115-ops.github.io/joreyfaber115.github.io/

Note: the repo is named `joreyfaber115.github.io`, but because the GitHub
account is `joreyfaber115-ops` (not an exact match), GitHub Pages serves it
as a project site under that account's namespace rather than at the bare
`joreyfaber115.github.io` domain. The URL above is the real one.

## Game modes
- **Rookie Camp** — biggest household names only.
- **Starting Lineup** — stars and standouts across every era since 1980.
- **Deep Draft** — role players and deep cuts. Brutal.
- **Active Stars** — curated list of today's biggest names (offline, reliable).
- **Current Rosters** — live active players pulled from ESPN's public API.

Type your answer — abbreviations and common nicknames are accepted
("USC", "Ole Miss", "The Ohio State University" all work), and small typos
are forgiven. Hints cost points; streaks earn bonuses. Best scores are saved
locally per mode.

## How it's hosted

The live site is a single self-contained `index.html` at the repo root — all
JavaScript and CSS are inlined into that one file. GitHub Pages serves it
directly, with no build step on GitHub's side.

One-time Pages setup (already done): **Settings → Pages → Source → Deploy from a
branch → Branch: `main`, Folder: `/ (root)`**.

The real source of truth is the React code in `src/`. The root `index.html` is
generated *from* that source — you don't edit it by hand.

## Making changes

Edit the React source in `src/`, never the built `index.html` directly:

- Add or edit players: `src/data/players.js` (all-time pool) or
  `src/data/additions.js` (Active Stars + all-time additions). Add school
  nicknames/abbreviations to the alias tables in those files.
- Change game logic or UI: `src/App.jsx`.
- Change styling: `src/styles.css`.

To preview locally while editing:
```bash
npm install      # first time only
npm run dev      # opens a hot-reloading dev server
```

## Rebuild + redeploy

After you're happy with your changes, regenerate the single file and push:
```bash
npm run build              # outputs dist/index.dev.html
cp dist/index.dev.html index.html   # (Windows PowerShell: copy dist\index.dev.html index.html)
git add -A
git commit -m "Describe your change"
git push
```

That's the whole redeploy. **You do NOT need to touch the Pages settings again** —
the one-time setup above is permanent. GitHub Pages automatically serves the new
`index.html` within a minute of the push. Just hard-refresh the site
(Ctrl+Shift+R) to see your changes.
