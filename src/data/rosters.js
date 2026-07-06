// Live "Current Rosters" mode — pulls active players from ESPN's public API.
// Note: ESPN endpoints are undocumented and may change; this mode degrades
// gracefully (the app falls back to the curated list if a fetch fails).
const BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// Fetch one team's roster, mapped to the game's player shape.
async function fetchTeamRoster(teamId) {
  const data = await getJson(`${BASE}/teams/${teamId}/roster`);
  const teamName = data?.team?.displayName || "";
  const players = [];
  for (const group of data?.athletes || []) {
    for (const a of group?.items || []) {
      const college = a?.college?.name;
      if (!college) continue; // skip players with no college on file
      players.push({
        name: a.displayName,
        pos: a?.position?.abbreviation || "",
        era: teamName, // show the current team in the "era" slot
        college,
        tier: 0,
        live: true,
      });
    }
  }
  return players;
}

// Fetch every team's roster in parallel and flatten into one pool.
export async function fetchLivePool() {
  const teamsData = await getJson(`${BASE}/teams`);
  const teams =
    teamsData?.sports?.[0]?.leagues?.[0]?.teams?.map((t) => t.team) || [];
  const ids = teams.map((t) => t.id).filter(Boolean);
  const results = await Promise.allSettled(ids.map((id) => fetchTeamRoster(id)));
  const pool = [];
  for (const r of results) {
    if (r.status === "fulfilled") pool.push(...r.value);
  }
  // De-dupe by name (rare, but safe).
  const seen = new Set();
  return pool.filter((p) => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });
}
