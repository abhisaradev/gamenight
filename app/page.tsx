import Link from "next/link";
import { getGamesWithCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

function countLabel(id: string, type: string, count: number): string {
  if (type === "rules") return "Rules + how to play";
  if (id === "trivia") return `${count} questions`;
  if (type === "wavelength") return `${count} spectrums`;
  if (type === "avoid") return `${count} categories`;
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export default async function HomePage() {
  let games;
  try {
    games = await getGamesWithCounts();
  } catch (e) {
    return (
      <main>
        <header className="app-header">
          <h1>🎲 Game Night</h1>
        </header>
        <p className="px-5 text-sm text-[var(--accent2)]">
          Couldn&apos;t load games. Check your Supabase env vars and that the
          database has been seeded.
        </p>
      </main>
    );
  }

  return (
    <main>
      <header className="app-header">
        <h1>🎲 Game Night</h1>
      </header>
      <div className="card-grid">
        <Link
          href="/word-generator"
          className="game-card wide-card"
          style={{ borderColor: "var(--accent4)" }}
        >
          <span className="emoji">🔤</span>
          <span className="name">Word Generator</span>
          <span className="count">Nouns · Verbs · Adjectives · Easy–Hard</span>
        </Link>
        {games.map((g) => (
          <Link key={g.id} href={`/game/${g.id}`} className="game-card">
            <span className="emoji">{g.emoji}</span>
            <span className="name">{g.name}</span>
            <span className="count">{countLabel(g.id, g.type, g.count)}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
