// Player photo lookup for curated modes (all-time pool + Active Stars).
// Live "Current Rosters" mode gets headshots directly from the ESPN roster
// API response (see rosters.js) — this module is only for players that
// don't already carry a `photo` field.
//
// Strategy: try ESPN's own athlete headshot first — these are always
// professional NFL portraits (never a college action shot with school
// branding visible, which would give the answer away). ESPN's index mostly
// covers players from the last few decades, so for older legends it won't
// have anything; in that case we fall back to Wikipedia's summary API,
// which covers virtually every notable player but occasionally surfaces a
// non-ideal action photo. Every lookup is cached in memory, and failures
// degrade gracefully — the UI falls back to a placeholder badge either way.

const cache = new Map(); // name -> url string | null (null = confirmed no photo)
const inflight = new Map(); // name -> Promise

const TITLE_OVERRIDES = {
  "Jim Brown": "Jim Brown (American football)",
};

async function espnHeadshot(name) {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/search/v2?query=${encodeURIComponent(name)}&limit=10`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const players = data.results?.find((r) => r.type === "player")?.contents || [];
    const nfl = players.find((p) => (p.description || "").toUpperCase() === "NFL");
    if (!nfl) return null;
    const m = /a:(\d+)/.exec(nfl.uid || "");
    if (!m) return null;
    const res2 = await fetch(
      `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${m[1]}`
    );
    if (!res2.ok) return null;
    const data2 = await res2.json();
    return data2.athlete?.headshot?.href || null;
  } catch {
    return null;
  }
}

async function wikipediaSummary(title) {
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

async function wikipediaPhoto(name) {
  try {
    const title = TITLE_OVERRIDES[name] || name;
    let url = await wikipediaSummary(title);
    if (!url && !TITLE_OVERRIDES[name]) {
      url = await wikipediaSummary(`${name} (American football)`);
    }
    return url;
  } catch {
    return null;
  }
}

export async function getPlayerPhoto(name) {
  if (cache.has(name)) return cache.get(name);
  if (inflight.has(name)) return inflight.get(name);

  const promise = (async () => {
    const url = (await espnHeadshot(name)) || (await wikipediaPhoto(name));
    cache.set(name, url);
    inflight.delete(name);
    return url;
  })();

  inflight.set(name, promise);
  return promise;
}
