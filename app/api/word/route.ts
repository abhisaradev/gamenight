import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Difficulty = "easy" | "medium" | "hard";

// Difficulty is approximated by word length (the random word API has no
// notion of difficulty): ≤5 = easy, 6–9 = medium, ≥10 = hard.
function difficultyFor(word: string): Difficulty {
  const n = word.length;
  if (n <= 5) return "easy";
  if (n <= 9) return "medium";
  return "hard";
}

// Maps the part-of-speech prefix Datamuse puts in front of a definition
// ("n\t…", "v\t…") to a readable word type.
const POS_LABEL: Record<string, string> = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
};

// Fetches a single random word from API Ninjas. `type` (noun/verb/adjective)
// is passed straight through — API Ninjas supports it natively.
async function fetchRandomWord(type: string, key: string): Promise<string | null> {
  const url = new URL("https://api.api-ninjas.com/v1/randomword");
  if (type && type !== "any") url.searchParams.set("type", type);

  const res = await fetch(url, {
    headers: { "X-Api-Key": key },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = await res.json();
  const w = Array.isArray(data?.word) ? data.word[0] : data?.word;
  return typeof w === "string" && w.length > 0 ? w : null;
}

// Fetches a definition (and inferred part of speech) from the free Datamuse
// API. Returns nulls if there's no definition or the request fails.
async function fetchDefinition(
  word: string
): Promise<{ definition: string | null; pos: string | null }> {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`,
      { cache: "no-store" }
    );
    if (!res.ok) return { definition: null, pos: null };

    const arr = await res.json();
    const raw = arr?.[0]?.defs?.[0];
    if (typeof raw !== "string") return { definition: null, pos: null };

    // defs look like "n\ta domesticated animal" — split off the POS prefix.
    const tab = raw.indexOf("\t");
    if (tab === -1) return { definition: raw, pos: null };
    return {
      definition: raw.slice(tab + 1),
      pos: POS_LABEL[raw.slice(0, tab)] ?? null,
    };
  } catch {
    return { definition: null, pos: null };
  }
}

export async function GET(req: Request) {
  const key = process.env.API_NINJAS_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "API_NINJAS_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "any").toLowerCase();
  const difficulty = (searchParams.get("difficulty") || "any").toLowerCase();

  // Keep asking for words until one matches the requested difficulty. After
  // 5 tries we accept whatever we last got rather than fail.
  let word: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const w = await fetchRandomWord(type, key);
    if (!w) continue;
    word = w;
    if (difficulty === "any" || difficultyFor(w) === difficulty) break;
  }

  if (!word) {
    return NextResponse.json(
      { error: "Couldn't fetch a word right now. Try again." },
      { status: 502 }
    );
  }

  const { definition, pos } = await fetchDefinition(word);

  return NextResponse.json({
    word,
    type: type !== "any" ? type : pos ?? "word",
    difficulty: difficultyFor(word),
    definition,
  });
}
