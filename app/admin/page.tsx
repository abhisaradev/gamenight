"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, GameRegistryRow } from "@/lib/supabase";
import {
  getAdminToken,
  setAdminToken,
  clearAdminToken,
} from "@/lib/adminClient";

export default function AdminHome() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [games, setGames] = useState<GameRegistryRow[]>([]);

  useEffect(() => {
    if (getAdminToken()) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    supabase
      .from("game_registry")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setGames((data ?? []) as GameRegistryRow[]));
  }, [authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setAdminToken(data.token);
        setAuthed(true);
      } else {
        setError(data.error ?? "Wrong password.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <main>
        <div className="screen-header">
          <Link href="/" className="back-btn">
            ←
          </Link>
          <div className="screen-title">✏️ Admin</div>
        </div>
        <form onSubmit={login} className="px-5 pt-6 flex flex-col gap-3">
          <p className="text-sm text-[var(--muted)]">
            Enter the admin password to manage games.
          </p>
          <input
            type="password"
            className="text-input"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-[var(--accent2)]">{error}</p>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <div className="screen-header">
        <Link href="/" className="back-btn">
          ←
        </Link>
        <div className="screen-title">✏️ Admin</div>
      </div>

      <div className="px-5 pt-3 flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">Pick a game to manage.</p>
        <button
          className="text-xs text-[var(--muted)] underline"
          onClick={() => {
            clearAdminToken();
            setAuthed(false);
          }}
        >
          Lock
        </button>
      </div>

      <div className="px-5 pt-3">
        <Link href="/admin/new-game" className="btn btn-primary block text-center">
          + New Game Section
        </Link>
      </div>

      <div className="q-list pt-4">
        {games.map((g) => (
          <Link
            key={g.id}
            href={`/admin/${g.id}`}
            className="q-item flex items-center justify-between"
          >
            <span>
              {g.emoji} {g.name}
            </span>
            <span className="text-[var(--muted)]">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
