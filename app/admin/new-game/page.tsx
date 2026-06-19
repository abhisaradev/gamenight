"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAdminToken } from "@/lib/adminClient";

const TYPES: { value: string; label: string }[] = [
  { value: "simple", label: "Simple — list of prompts + random picker" },
  { value: "trivia", label: "Trivia — questions, answers, categories" },
  { value: "avoid", label: "Avoid — category + off-limits answer" },
  { value: "wavelength", label: "Wavelength — left/right spectrum dial" },
  { value: "fivesec", label: "5 Second — prompts with countdown" },
  { value: "rules", label: "Rules only — how-to-play screen" },
];

function slugify(name: string): string {
  return (
    "custom_" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") +
    "_" +
    Date.now().toString(36)
  );
}

export default function NewGamePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [emoji, setEmoji] = useState("🎯");
  const [name, setName] = useState("");
  const [type, setType] = useState("simple");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !emoji.trim()) {
      setError("Emoji and name are required.");
      return;
    }
    setBusy(true);

    const { count } = await supabase
      .from("game_registry")
      .select("*", { count: "exact", head: true });

    const id = slugify(name);
    const { error: err } = await supabase.from("game_registry").insert({
      id,
      emoji: emoji.trim(),
      name: name.trim(),
      type,
      is_custom: true,
      sort_order: (count ?? 0) + 1,
    });

    setBusy(false);
    if (err) {
      setError("Error: " + err.message);
      return;
    }
    router.push(`/admin/${id}`);
  }

  return (
    <main>
      <div className="screen-header">
        <Link href="/admin" className="back-btn">
          ←
        </Link>
        <div className="screen-title">+ New Game</div>
      </div>

      <form onSubmit={create} className="px-5 pt-5 flex flex-col gap-3">
        <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
          Emoji
        </label>
        <input
          className="text-input"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          maxLength={4}
        />

        <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
          Name
        </label>
        <input
          className="text-input"
          placeholder="e.g. Never Have I Ever"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="text-xs text-[var(--muted)] uppercase tracking-wide">
          Type
        </label>
        <select
          className="text-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {error && <p className="text-sm text-[var(--accent2)]">{error}</p>}

        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Creating…" : "Create & Add Content"}
        </button>
      </form>
    </main>
  );
}
