// Player photo lookup for curated modes (all-time pool + Active Stars).
// Live "Current Rosters" mode gets headshots directly from the ESPN roster
// API response (see rosters.js) — this module is only for players that
// don't already carry a `photo` field.
//
// Strategy: Wikipedia's REST summary API is public, CORS-enabled, and covers
// virtually every notable NFL player (retired legends included), so it's a
// good fit for a static site with no backend and no per-player curation.
// Every lookup is cached in memory, and failures degrade gracefully — the UI
// falls back to a placeholder badge, it never breaks the game.

const cache = new Map(); // name -> url string | null (null = confirmed no photo)
const inflight = new Map(); // name -> Promise

// Small set of manual overrides for names Wikipedia commonly disambiguates
// away from the football player.
const TITLE_OVERRIDES = {
  "Jim Brown": "Jim Brown (American football)",
};

async function fetchSummary(title) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title.replace(/ /g, "_")
    )}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type === "disambiguation") return null;
  return data.thumbnail?.source || data.originalimage?.source || null;
}

export async function getPlayerPhoto(name) {
  if (cache.has(name)) return cache.get(name);
  if (inflight.has(name)) return inflight.get(name);

  const promise = (async () => {
    try {
      const title = TITLE_OVERRIDES[name] || name;
      let url = await fetchSummary(title);
      if (!url && !TITLE_OVERRIDES[name]) {
        url = await fetchSummary(`${name} (American football)`);
      }
      cache.set(name, url);
      return url;
    } catch {
      cache.set(name, null);
      return null;
    } finally {
      inflight.delete(name);
    }
  })();

  inflight.set(name, promise);
  return promise;
}
