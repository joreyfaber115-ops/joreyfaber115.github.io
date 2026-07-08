import { useEffect, useRef, useState } from "react";
import { PLAYERS, CURRENT_PLAYERS } from "./data/dataset.js";
import { isCorrectGuess } from "./data/matching.js";
import { fetchLivePool } from "./data/rosters.js";

const TIER_NAMES = { 1: "Rookie Camp", 2: "Starting Lineup", 3: "Deep Draft", active: "Active Stars", live: "Current Rosters" };
const STORAGE_PREFIX = "ntc_best_";

function poolForTier(tier) {
  if (tier === 1) return PLAYERS.filter((p) => p.tier === 1);
  if (tier === 2) return PLAYERS.filter((p) => p.tier === 1 || p.tier === 2);
  if (tier === 3) return PLAYERS.filter((p) => p.tier === 3);
  if (tier === "active") return CURRENT_PLAYERS;
  return [];
}

function getBest(mode) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + mode);
    if (!raw) return { score: 0, streak: 0 };
    return JSON.parse(raw);
  } catch {
    return { score: 0, streak: 0 };
  }
}
function setBest(mode, score, streak) {
  try {
    const cur = getBest(mode);
    const next = { score: Math.max(cur.score, score), streak: Math.max(cur.streak, streak) };
    localStorage.setItem(STORAGE_PREFIX + mode, JSON.stringify(next));
    return next;
  } catch {
    return { score: 0, streak: 0 };
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TIERS = [
  { id: 1, name: "Rookie Camp", desc: "Only the biggest household names. Great for casual fans and warming up." },
  { id: 2, name: "Starting Lineup", desc: "Stars and standouts across every era since 1980. The full, balanced experience." },
  { id: 3, name: "Deep Draft", desc: "Role players, specialists, and names only true film-room heads will know. Brutal." },
  { id: "active", name: "Active Stars", desc: "A curated set of today's biggest names — offline and reliable, no live feed needed." },
  { id: "live", name: "Current Rosters", desc: "Live from ESPN — active players on today's NFL rosters. Fresh every game.", live: true },
];

export default function App() {
  const [screen, setScreen] = useState("difficulty");
  const [mode, setMode] = useState(2);
  const [livePool, setLivePool] = useState(null);
  const [liveState, setLiveState] = useState("idle");

  const [deck, setDeck] = useState([]);
  const [current, setCurrent] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBestState] = useState({ score: 0, streak: 0 });

  const [guess, setGuess] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [lastGuess, setLastGuess] = useState("");
  const [hintUsed, setHintUsed] = useState(false);
  const [pointsMsg, setPointsMsg] = useState("");
  const [newBest, setNewBest] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const inputRef = useRef(null);

  const activePool = mode === "live" ? livePool || [] : poolForTier(mode);

  function dealFrom(pool, curDeck) {
    const d = curDeck && curDeck.length ? curDeck : shuffle(pool);
    const next = d[d.length - 1];
    return { card: next, rest: d.slice(0, -1) };
  }

  function resetRoundUi() {
    setGuess("");
    setAnswered(false);
    setCorrect(false);
    setLastGuess("");
    setHintUsed(false);
    setPointsMsg("");
    setNewBest(false);
    setShareMsg("");
  }

  function beginRun(selectedMode, pool) {
    setMode(selectedMode);
    setScore(0);
    setStreak(0);
    setRound(1);
    setBestState(getBest(selectedMode));
    const { card, rest } = dealFrom(pool, null);
    setDeck(rest);
    setCurrent(card);
    resetRoundUi();
    setScreen("game");
  }

  async function chooseMode(m) {
    if (m === "live") {
      setScreen("game");
      setMode("live");
      setLiveState("loading");
      try {
        const pool = livePool || (await fetchLivePool());
        if (!pool.length) throw new Error("empty");
        setLivePool(pool);
        setLiveState("ready");
        beginRun("live", pool);
      } catch {
        setLiveState("error");
      }
    } else {
      beginRun(m, poolForTier(m));
    }
  }

  useEffect(() => {
    if (screen === "game" && !answered && current && inputRef.current) {
      inputRef.current.focus();
    }
  }, [screen, current, answered]);

  function submitGuess(e) {
    e.preventDefault();
    if (answered) return;
    const g = guess.trim();
    if (!g) return;
    endRound(isCorrectGuess(g, current.college), g);
  }

  function endRound(ok, guessText) {
    setAnswered(true);
    setCorrect(ok);
    setLastGuess(guessText || "");
    let nextScore = score;
    let nextStreak = streak;
    if (ok) {
      let pts = 100;
      if (hintUsed) pts -= 50;
      pts += streak * 10;
      nextScore = score + pts;
      nextStreak = streak + 1;
      setPointsMsg(`+${pts} pts · streak bonus included`);
    } else {
      nextStreak = 0;
      setPointsMsg(guessText ? "Streak reset. Onward." : "Skipped. Streak reset.");
    }
    setScore(nextScore);
    setStreak(nextStreak);
    const updated = setBest(mode, nextScore, nextStreak);
    setBestState(updated);
    setNewBest(ok && nextScore > 0 && nextScore === updated.score);
  }

  function nextPlayer() {
    setRound((r) => r + 1);
    const { card, rest } = dealFrom(activePool, deck);
    setDeck(rest);
    setCurrent(card);
    resetRoundUi();
  }

  async function share() {
    const text = `🏈 Name The College — ${TIER_NAMES[mode]}\nScore: ${score} · Streak: ${streak}\nCan you beat me?`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareMsg("Copied to clipboard.");
    } catch {
      setShareMsg(text);
    }
  }

  const hint = current
    ? `Hint: the school name has ${current.college.replace(/\s*\([^)]*\)/, "").length} characters and starts with "${current.college[0]}".`
    : "";

  return (
    <div className="wrap">
      <h1 className="title">Name The College</h1>
      <div className="subtitle">an all-time NFL scouting report · players since 1980</div>

      {screen === "difficulty" && (
        <div className="tier-cards">
          {TIERS.map((t) => {
            const count = t.live ? null : poolForTier(t.id).length;
            const b = getBest(t.id);
            return (
              <button key={t.id} className="tier-card" type="button" onClick={() => chooseMode(t.id)}>
                <div className="tier-name">
                  <span>{t.name}</span>
                  <span className="tier-count">{t.live ? "LIVE · ESPN" : `${count} PROSPECTS`}</span>
                </div>
                <div className="tier-desc">{t.desc}</div>
                <div className="tier-best">
                  {b.score > 0 ? `Your best: ${b.score} pts · streak ${b.streak}` : "No runs yet"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {screen === "game" && mode === "live" && liveState !== "ready" && (
        <div className="card">
          {liveState === "loading" && (
            <>
              <div className="player-name">Loading…</div>
              <div className="player-meta">Pulling live rosters from ESPN</div>
            </>
          )}
          {liveState === "error" && (
            <>
              <div className="player-name">Couldn’t reach ESPN</div>
              <div className="player-meta">The live feed is unavailable right now.</div>
              <div className="btn-row">
                <button className="btn-primary" onClick={() => chooseMode("live")}>Try again</button>
                <button className="btn-gold" onClick={() => beginRun(2, poolForTier(2))}>Play curated instead</button>
              </div>
            </>
          )}
        </div>
      )}

      {screen === "game" && current && (mode !== "live" || liveState === "ready") && (
        <>
          <div className="meta-row">
            <span>{TIER_NAMES[mode].toUpperCase()}</span>
            <button type="button" className="link-btn" onClick={() => setScreen("difficulty")}>
              Change Difficulty
            </button>
          </div>

          <div className="scoreboard">
            <div className="sb-block">
              <div className="sb-label">Score</div>
              <div className="sb-value">{score}</div>
            </div>
            <div className="sb-divider" />
            <div className="sb-block">
              <div className="sb-label">Streak</div>
              <div className="sb-value">{streak}</div>
            </div>
            <div className="sb-divider" />
            <div className="sb-block">
              <div className="sb-label">Best</div>
              <div className="sb-value">{best.score}</div>
            </div>
          </div>

          <div className={`card${answered ? (correct ? " state-correct" : " state-wrong") : ""}`}>
            <div className="report-row">
              <span>Prospect File</span>
              <span>#{String(round).padStart(3, "0")}</span>
            </div>
            <div className="player-name">{current.name}</div>
            <div className="player-meta">
              {current.pos} · {current.era}
            </div>

            <div className="prompt">Where did this player go to college?</div>
            <form className="guess-form" onSubmit={submitGuess} autoComplete="off">
              <input
                ref={inputRef}
                type="text"
                value={guess}
                disabled={answered}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type the school name…"
              />
              <button type="submit" className="btn-primary" disabled={answered}>
                Lock It In
              </button>
            </form>

            {hintUsed && !answered && <div className="hint-text">{hint}</div>}

            {!answered && (
              <div className="btn-row">
                <button type="button" className="btn-secondary" onClick={() => !hintUsed && setHintUsed(true)} disabled={hintUsed}>
                  Request Hint (−50 pts)
                </button>
                <button type="button" className="btn-secondary" onClick={() => endRound(false, null)}>
                  Skip
                </button>
              </div>
            )}

            {answered && (
              <div className="result-panel">
                <span className={`stamp ${correct ? "correct" : "wrong"}`}>{correct ? "CORRECT" : "NOPE"}</span>
                {!correct && (
                  <div className="your-guess-line">
                    {lastGuess ? (
                      <>
                        Your guess: <b>{lastGuess}</b>
                      </>
                    ) : (
                      <>
                        <b>Skipped</b> — no guess submitted.
                      </>
                    )}
                  </div>
                )}
                <div className="answer-line">
                  Correct school: <b>{current.college}</b>
                </div>
                <div className="points-line">{pointsMsg}</div>
                {newBest && <div className="best-line">New personal best for {TIER_NAMES[mode]}!</div>}
                <div className="btn-row">
                  <button type="button" className="btn-primary" onClick={nextPlayer}>
                    Next Prospect →
                  </button>
                  <button type="button" className="btn-gold" onClick={share}>
                    Share Result
                  </button>
                </div>
                {shareMsg && <div className="share-toast">{shareMsg}</div>}
              </div>
            )}
          </div>
        </>
      )}

      <div className="footer-note">
        {mode === "live"
          ? "live active rosters via ESPN · type any reasonable name or abbreviation"
          : "175+ legends since 1980 · type any reasonable name or abbreviation — we’ll know what you mean"}
      </div>
    </div>
  );
}
