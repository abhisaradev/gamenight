"use client";

import { useState } from "react";

const ACCENT = "#a8ff78";

type Difficulty = "easy" | "medium" | "hard";

interface WordResult {
  word: string;
  type: string;
  difficulty: Difficulty;
  definition: string | null;
}

const DIFFICULTY_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "#a8ff78",
  medium: "#f5c842",
  hard: "#ff6b6b",
};

function ToggleRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="section-label" style={{ paddingBottom: 6 }}>
        {label}
      </div>
      <div className="wg-toggle-row">
        {options.map((o) => (
          <button
            key={o.value}
            className={`wg-toggle${value === o.value ? " active" : ""}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WordClient() {
  const [difficulty, setDifficulty] = useState("any");
  const [result, setResult] = useState<WordResult | null>(null);
  const [history, setHistory] = useState<WordResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/word?difficulty=${encodeURIComponent(difficulty)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      const word = data as WordResult;
      setResult(word);
      setHistory((prev) =>
        [word, ...prev.filter((w) => w.word !== word.word)].slice(0, 20)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="wg-filters">
        <ToggleRow
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={difficulty}
          onChange={setDifficulty}
        />
      </div>

      <div className="px-5 pt-4">
        <button
          className="random-btn"
          style={{ background: ACCENT, opacity: loading ? 0.6 : 1 }}
          onClick={generate}
          disabled={loading}
        >
          {loading ? "Generating…" : "🔤 Generate Word"}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 text-sm text-[var(--accent2)]">{error}</div>
      )}

      {result && (
        <div className="wg-result">
          <div className="wg-word">{result.word}</div>
          <div className="wg-badges">
            <span className="wg-badge" style={{ color: ACCENT, borderColor: ACCENT }}>
              {result.type}
            </span>
            <span
              className="wg-badge"
              style={{
                color: DIFFICULTY_COLOR[result.difficulty],
                borderColor: DIFFICULTY_COLOR[result.difficulty],
              }}
            >
              {result.difficulty}
            </span>
          </div>
          <div className="wg-def">
            {result.definition ?? "No definition found for this word."}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="section-label">Recent ({history.length})</div>
          <div className="wg-history">
            {history.map((w) => (
              <button
                key={w.word}
                className="wg-chip"
                onClick={() => setResult(w)}
              >
                {w.word}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
