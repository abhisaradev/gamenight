import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame, getContent } from "@/lib/queries";
import { RULES } from "@/lib/games";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic";

export default async function GamePage({
  params,
}: {
  params: { id: string };
}) {
  const game = await getGame(params.id);
  if (!game) notFound();

  const content = await getContent(params.id);
  const rules = RULES[params.id];

  return (
    <main>
      <div className="screen-header">
        <Link href="/" className="back-btn">
          ←
        </Link>
        <div className="screen-title">
          {game.emoji} {game.name}
        </div>
      </div>

      {rules && (
        <>
          <div className="rules-box">
            <div className="rules-label" style={{ color: rules.color }}>
              How to Play
            </div>
            <ol className="rules-body list-decimal pl-4">
              {rules.steps.map((s, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
              ))}
            </ol>
          </div>
          {rules.example && (
            <div
              className="rules-box"
              style={{ marginTop: 14, background: "var(--surface)" }}
            >
              <div className="rules-label" style={{ color: "var(--muted)" }}>
                Example
              </div>
              <div className="rules-body">
                {rules.example.map((s, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: s }} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <GameClient game={game} content={content} />
    </main>
  );
}
