"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameContentRow, GameRegistryRow } from "@/lib/supabase";
import { TRIVIA_CATEGORIES, accentFor } from "@/lib/games";

export default function GameClient({
  game,
  content,
}: {
  game: GameRegistryRow;
  content: GameContentRow[];
}) {
  const accent = accentFor(game.id);

  if (game.type === "trivia") return <Trivia content={content} accent={accent} />;
  if (game.type === "wavelength")
    return <Wavelength content={content} accent={accent} />;
  if (game.type === "fivesec")
    return <FiveSecond content={content} accent={accent} />;
  if (game.type === "avoid") return <Avoid content={content} accent={accent} />;
  if (game.type === "rules") return null;
  return <Simple content={content} accent={accent} />;
}

/* ───────────────────────── Simple ───────────────────────── */

function RandomPicker({
  items,
  accent,
  label,
}: {
  items: string[];
  accent: string;
  label: string;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const roll = () => {
    if (!items.length) return;
    setPick(items[Math.floor(Math.random() * items.length)]);
  };
  return (
    <>
      <div className="px-5 pt-3.5">
        <button
          className="random-btn"
          style={{ background: accent }}
          onClick={roll}
        >
          🎲 {label}
        </button>
      </div>
      {pick && <div className="random-display">{pick}</div>}
    </>
  );
}

function Simple({
  content,
  accent,
}: {
  content: GameContentRow[];
  accent: string;
}) {
  const items = content.map((c) => c.content);
  return (
    <>
      <RandomPicker items={items} accent={accent} label="Random Pick" />
      <div className="section-label">All ({items.length})</div>
      <div className="q-list">
        {content.map((c) => (
          <div key={c.id} className="q-item">
            {c.content}
          </div>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────── Avoid ───────────────────────── */

function Avoid({
  content,
  accent,
}: {
  content: GameContentRow[];
  accent: string;
}) {
  const [pick, setPick] = useState<GameContentRow | null>(null);
  const roll = () => {
    if (!content.length) return;
    setPick(content[Math.floor(Math.random() * content.length)]);
  };
  return (
    <>
      <div className="px-5 pt-3.5">
        <button className="random-btn" style={{ background: accent }} onClick={roll}>
          🎲 Random Category
        </button>
      </div>
      {pick && (
        <div className="random-display">
          <div className="text-[13px] uppercase tracking-wide text-[var(--muted)] mb-2">
            {pick.content}
          </div>
          <div className="text-[22px] font-display font-extrabold">
            🚫 Avoid: {pick.content_b ?? "— (no off-limits answer)"}
          </div>
        </div>
      )}
      <div className="section-label">All Categories ({content.length})</div>
      <div className="q-list">
        {content.map((c) => (
          <div key={c.id} className="q-item flex justify-between gap-3">
            <span>{c.content}</span>
            <span className="text-[var(--accent2)] font-semibold whitespace-nowrap">
              {c.content_b ? `🚫 ${c.content_b}` : "—"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────── Trivia ───────────────────────── */

function Trivia({
  content,
  accent,
}: {
  content: GameContentRow[];
  accent: string;
}) {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState<GameContentRow | null>(null);

  const filtered = useMemo(() => {
    return content.filter((c) => {
      const matchCat = cat === "all" || c.category === cat;
      const matchQ =
        !query ||
        c.content.toLowerCase().includes(query.toLowerCase()) ||
        (c.answer ?? "").toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [content, cat, query]);

  const toggle = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const roll = () => {
    if (!filtered.length) return;
    const p = filtered[Math.floor(Math.random() * filtered.length)];
    setPick(p);
    setRevealed((prev) => new Set(prev).add(p.id));
  };

  return (
    <>
      <div className="px-5 pt-3.5">
        <button className="random-btn" style={{ background: accent }} onClick={roll}>
          🎲 Random Question
        </button>
      </div>
      {pick && (
        <div className="random-display">
          <div>{pick.content}</div>
          <div className="mt-3 text-[var(--accent4)] font-semibold">
            {pick.answer}
          </div>
        </div>
      )}

      <div className="tab-row">
        {TRIVIA_CATEGORIES.map((t) => (
          <button
            key={t.id}
            className={`tab${cat === t.id ? " active" : ""}`}
            onClick={() => setCat(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5">
        <input
          className="text-input"
          placeholder="Search questions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="section-label">
        {filtered.length} {filtered.length === 1 ? "question" : "questions"}
      </div>
      <div className="q-list">
        {filtered.map((c) => (
          <button
            key={c.id}
            className="q-item text-left"
            onClick={() => toggle(c.id)}
          >
            <div>{c.content}</div>
            {revealed.has(c.id) ? (
              <div className="mt-2 text-[var(--accent4)] font-semibold">
                {c.answer}
              </div>
            ) : (
              <div className="mt-2 text-[11px] uppercase tracking-wide text-[var(--muted)]">
                Tap to reveal answer
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────── Wavelength ───────────────────────── */

function Wavelength({
  content,
  accent,
}: {
  content: GameContentRow[];
  accent: string;
}) {
  const [round, setRound] = useState<GameContentRow | null>(null);
  const [target, setTarget] = useState(50);
  const [guess, setGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const newRound = () => {
    if (!content.length) return;
    setRound(content[Math.floor(Math.random() * content.length)]);
    setTarget(Math.round(8 + Math.random() * 84));
    setGuess(null);
    setRevealed(false);
  };

  const onTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (revealed || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setGuess(Math.max(0, Math.min(100, pct)));
  };

  const score = useMemo(() => {
    if (guess === null) return 0;
    const d = Math.abs(guess - target);
    if (d <= 5) return 4;
    if (d <= 12) return 3;
    if (d <= 20) return 2;
    return 0;
  }, [guess, target]);

  return (
    <>
      <div className="rules-box" style={{ marginTop: 10, background: "var(--surface)" }}>
        <div className="rules-label" style={{ color: "var(--muted)" }}>
          Scoring
        </div>
        <div className="flex flex-wrap gap-2 text-[12px]">
          <span className="px-2 py-1 rounded-md bg-[var(--surface2)]">🎯 Bullseye = 4</span>
          <span className="px-2 py-1 rounded-md bg-[var(--surface2)]">Inner = 3</span>
          <span className="px-2 py-1 rounded-md bg-[var(--surface2)]">Outer = 2</span>
          <span className="px-2 py-1 rounded-md bg-[var(--surface2)]">Miss = 0</span>
        </div>
      </div>

      <div className="px-5 pt-3.5">
        <button className="random-btn" style={{ background: accent }} onClick={newRound}>
          🎲 New Spectrum
        </button>
      </div>

      {round && (
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex justify-between font-display font-extrabold text-[15px] mb-1">
            <span>{round.content}</span>
            <span>{round.content_b}</span>
          </div>
          <div className="text-[11px] text-[var(--muted)] mb-4">
            {revealed
              ? `Target was ${target}% — you scored ${score} pts`
              : "Psychic: tap where your clue lands on this scale"}
          </div>

          <div
            ref={barRef}
            onClick={onTap}
            className="relative h-12 rounded-full cursor-pointer overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg,#6bcfff 0%,#a8ff78 50%,#ff6b6b 100%)",
            }}
          >
            {revealed && (
              <>
                <Zone center={target} half={20} color="rgba(255,255,255,0.12)" />
                <Zone center={target} half={12} color="rgba(255,255,255,0.18)" />
                <Zone center={target} half={5} color="rgba(255,255,255,0.45)" />
                <Marker pct={target} label="🎯" />
              </>
            )}
            {guess !== null && (
              <div
                className="absolute top-0 h-full w-[3px] bg-black"
                style={{ left: `calc(${guess}% - 1.5px)` }}
              />
            )}
          </div>

          {guess !== null && !revealed && (
            <button
              className="btn btn-primary w-full mt-4"
              onClick={() => setRevealed(true)}
            >
              Reveal & Score
            </button>
          )}
        </div>
      )}
    </>
  );
}

function Zone({
  center,
  half,
  color,
}: {
  center: number;
  half: number;
  color: string;
}) {
  const left = Math.max(0, center - half);
  const right = Math.min(100, center + half);
  return (
    <div
      className="absolute top-0 h-full"
      style={{ left: `${left}%`, width: `${right - left}%`, background: color }}
    />
  );
}

function Marker({ pct, label }: { pct: number; label: string }) {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-lg"
      style={{ left: `${pct}%` }}
    >
      {label}
    </div>
  );
}

/* ───────────────────────── 5 Second Challenge ───────────────────────── */

function FiveSecond({
  content,
  accent,
}: {
  content: GameContentRow[];
  accent: string;
}) {
  const [prompt, setPrompt] = useState<string>(
    content[0]?.content ?? "No prompts yet"
  );
  const [remaining, setRemaining] = useState(5);
  const [running, setRunning] = useState(false);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const nextPrompt = () => {
    if (!content.length) return;
    setPrompt(content[Math.floor(Math.random() * content.length)].content);
    stop();
    setRemaining(5);
  };

  const stop = () => {
    setRunning(false);
    cancelAnimationFrame(rafRef.current);
  };

  const start = () => {
    setRunning(true);
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      const left = Math.max(0, 5 - elapsed);
      setRemaining(left);
      if (left > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const frac = remaining / 5;
  const ringColor =
    frac > 0.6 ? "#a8ff78" : frac > 0.3 ? "#f5c842" : "#ff6b6b";
  const R = 80;
  const C = 2 * Math.PI * R;

  return (
    <>
      <div className="flex flex-col items-center pt-6">
        <div className="relative w-[200px] h-[200px]">
          <svg width="200" height="200" className="-rotate-90">
            <circle cx="100" cy="100" r={R} stroke="var(--surface2)" strokeWidth="12" fill="none" />
            <circle
              cx="100"
              cy="100"
              r={R}
              stroke={ringColor}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - frac)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-5xl">
            {Math.ceil(remaining)}
          </div>
        </div>

        <div className="mx-5 mt-6 text-center text-[20px] font-display font-extrabold px-5">
          {prompt}
        </div>

        <div className="flex gap-3 mt-6 px-5 w-full">
          <button
            className="btn flex-1"
            style={{ background: accent, color: "#000", borderColor: accent }}
            onClick={running ? stop : start}
          >
            {running ? "Stop" : "Start"}
          </button>
          <button className="btn flex-1" onClick={nextPrompt}>
            Next Prompt
          </button>
        </div>
      </div>
    </>
  );
}
