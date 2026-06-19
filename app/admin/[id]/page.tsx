"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, GameContentRow, GameRegistryRow } from "@/lib/supabase";
import { getAdminToken } from "@/lib/adminClient";
import { bulkHint } from "@/lib/games";
import { defaultRowsFor, BUILTIN_IDS } from "@/lib/seed-data";

export default function AdminGamePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const gameId = params.id;

  const [ready, setReady] = useState(false);
  const [game, setGame] = useState<GameRegistryRow | null>(null);
  const [items, setItems] = useState<GameContentRow[]>([]);
  const [msg, setMsg] = useState("");

  // single-add fields
  const [f1, setF1] = useState(""); // content / question / left / category
  const [f2, setF2] = useState(""); // content_b / right / avoid
  const [fAnswer, setFAnswer] = useState("");
  const [fCat, setFCat] = useState("quickfire");

  // bulk
  const [bulk, setBulk] = useState("");

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin");
      return;
    }
    setReady(true);
  }, [router]);

  const load = useCallback(async () => {
    const [{ data: g }, { data: c }] = await Promise.all([
      supabase.from("game_registry").select("*").eq("id", gameId).maybeSingle(),
      supabase
        .from("game_content")
        .select("*")
        .eq("game_id", gameId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);
    setGame((g as GameRegistryRow) ?? null);
    setItems((c ?? []) as GameContentRow[]);
  }, [gameId]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  if (!ready || !game) return null;

  const type = game.type;
  const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;

  async function addOne(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    let row: Partial<GameContentRow> | null = null;

    if (type === "trivia") {
      if (!f1.trim()) return;
      row = { content: f1.trim(), answer: fAnswer.trim() || null, category: fCat };
    } else if (type === "wavelength") {
      if (!f1.trim() || !f2.trim()) return;
      row = { content: f1.trim(), content_b: f2.trim() };
    } else if (type === "avoid") {
      if (!f1.trim()) return;
      row = { content: f1.trim(), content_b: f2.trim() || null };
    } else {
      if (!f1.trim()) return;
      row = { content: f1.trim() };
    }

    const { error } = await supabase
      .from("game_content")
      .insert({ ...row, game_id: gameId, sort_order: nextOrder });
    if (error) return setMsg("Error: " + error.message);

    setF1("");
    setF2("");
    setFAnswer("");
    setMsg("Added ✓");
    load();
  }

  async function addBulk() {
    setMsg("");
    const lines = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;

    const rows = lines.map((line, i) => {
      const order = nextOrder + i;
      if (type === "trivia") {
        const [q, a, cat] = line.split("|").map((s) => s.trim());
        return {
          game_id: gameId,
          content: q,
          answer: a || null,
          category: cat || "quickfire",
          sort_order: order,
        };
      }
      if (type === "wavelength") {
        const [l, r] = line.split("|").map((s) => s.trim());
        return { game_id: gameId, content: l, content_b: r || null, sort_order: order };
      }
      if (type === "avoid") {
        const [c, av] = line.split("|").map((s) => s.trim());
        return { game_id: gameId, content: c, content_b: av || null, sort_order: order };
      }
      return { game_id: gameId, content: line, sort_order: order };
    });

    const { error } = await supabase.from("game_content").insert(rows);
    if (error) return setMsg("Error: " + error.message);
    setBulk("");
    setMsg(`Added ${rows.length} items ✓`);
    load();
  }

  async function del(id: string) {
    const { error } = await supabase.from("game_content").delete().eq("id", id);
    if (error) return setMsg("Error: " + error.message);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function resetDefault() {
    if (!confirm("Reset this game to its default content? This deletes current items."))
      return;
    setMsg("Resetting…");
    await supabase.from("game_content").delete().eq("game_id", gameId);
    const defaults = defaultRowsFor(gameId).map((r) => ({ ...r }));
    if (defaults.length) {
      const { error } = await supabase.from("game_content").insert(defaults);
      if (error) return setMsg("Error: " + error.message);
    }
    setMsg("Reset ✓");
    load();
  }

  return (
    <main>
      <div className="screen-header">
        <Link href="/admin" className="back-btn">
          ←
        </Link>
        <div className="screen-title">
          {game.emoji} {game.name}
        </div>
      </div>

      {msg && <div className="px-5 pt-2 text-sm text-[var(--accent4)]">{msg}</div>}

      {/* Add single */}
      <div className="section-label">Add Item</div>
      <form onSubmit={addOne} className="px-5 flex flex-col gap-2.5">
        {type === "trivia" && (
          <>
            <textarea
              className="text-input"
              placeholder="Question"
              value={f1}
              onChange={(e) => setF1(e.target.value)}
              rows={2}
            />
            <input
              className="text-input"
              placeholder="Answer"
              value={fAnswer}
              onChange={(e) => setFAnswer(e.target.value)}
            />
            <select
              className="text-input"
              value={fCat}
              onChange={(e) => setFCat(e.target.value)}
            >
              {["quickfire", "mc", "friends", "medium", "hard", "riddle"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </>
        )}

        {type === "wavelength" && (
          <div className="flex gap-2">
            <input
              className="text-input"
              placeholder="Left"
              value={f1}
              onChange={(e) => setF1(e.target.value)}
            />
            <input
              className="text-input"
              placeholder="Right"
              value={f2}
              onChange={(e) => setF2(e.target.value)}
            />
          </div>
        )}

        {type === "avoid" && (
          <>
            <input
              className="text-input"
              placeholder="Category"
              value={f1}
              onChange={(e) => setF1(e.target.value)}
            />
            <input
              className="text-input"
              placeholder="Avoid answer (optional)"
              value={f2}
              onChange={(e) => setF2(e.target.value)}
            />
          </>
        )}

        {(type === "simple" || type === "fivesec" || type === "rules") && (
          <textarea
            className="text-input"
            placeholder="New item"
            value={f1}
            onChange={(e) => setF1(e.target.value)}
            rows={2}
          />
        )}

        <button className="btn btn-primary">Add</button>
      </form>

      {/* Bulk add */}
      <div className="section-label">Bulk Add</div>
      <div className="px-5 flex flex-col gap-2.5">
        <p className="text-xs text-[var(--muted)] whitespace-pre-line">
          {bulkHint(type)}
        </p>
        <textarea
          className="text-input"
          rows={5}
          placeholder="One item per line…"
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
        />
        <button className="btn" onClick={addBulk} type="button">
          Add All
        </button>
      </div>

      {/* Items */}
      <div className="section-label">Items ({items.length})</div>
      <div className="q-list">
        {items.map((it) => (
          <div key={it.id} className="q-item flex items-start justify-between gap-3">
            <div className="flex-1">
              <div>{it.content}</div>
              {it.content_b && (
                <div className="text-[var(--accent3)] text-xs mt-1">↔ {it.content_b}</div>
              )}
              {it.answer && (
                <div className="text-[var(--accent4)] text-xs mt-1">A: {it.answer}</div>
              )}
              {it.category && (
                <div className="text-[var(--muted)] text-[11px] mt-1 uppercase">
                  {it.category}
                </div>
              )}
            </div>
            <button
              className="text-[var(--accent2)] text-lg leading-none px-1"
              onClick={() => del(it.id)}
              aria-label="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Reset */}
      {BUILTIN_IDS.has(gameId) && (
        <div className="px-5 pt-6">
          <button className="btn btn-danger w-full" onClick={resetDefault}>
            Reset to default content
          </button>
        </div>
      )}
    </main>
  );
}
