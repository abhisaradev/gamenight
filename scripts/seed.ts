/**
 * Seed script — populates Supabase with the default game registry and content.
 *
 * Usage:
 *   npx ts-node scripts/seed.ts          # seed once (skips if already seeded)
 *   npx ts-node scripts/seed.ts --force  # wipe built-in games and reseed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the
 * environment (loaded from .env.local / .env via dotenv).
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { BUILTIN_GAMES, buildContentRows } from "../lib/seed-data";

// Load env from .env.local first (Next convention), then .env as fallback.
dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (e.g. in .env.local)."
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const force = process.argv.includes("--force");

async function main() {
  console.log("🌱 Game Night seed starting…");

  // Idempotency: skip if the registry already has built-in games.
  const { data: existing, error: checkErr } = await supabase
    .from("game_registry")
    .select("id")
    .eq("is_custom", false)
    .limit(1);

  if (checkErr) {
    console.error("❌ Could not read game_registry. Did you run the migration (001_init.sql)?");
    console.error(checkErr.message);
    process.exit(1);
  }

  if (existing && existing.length > 0 && !force) {
    console.log("✅ Already seeded — skipping. Use --force to wipe built-ins and reseed.");
    return;
  }

  const builtinIds = BUILTIN_GAMES.map((g) => g.id);

  if (force) {
    console.log("♻️  --force: clearing existing built-in games and their content…");
    await supabase.from("game_content").delete().in("game_id", builtinIds);
    await supabase.from("game_registry").delete().in("id", builtinIds);
  }

  // Insert registry rows.
  const registryRows = BUILTIN_GAMES.map((g, i) => ({
    id: g.id,
    emoji: g.emoji,
    name: g.name,
    type: g.type,
    is_custom: false,
    sort_order: i,
  }));

  const { error: regErr } = await supabase.from("game_registry").upsert(registryRows);
  if (regErr) {
    console.error("❌ Failed inserting game_registry:", regErr.message);
    process.exit(1);
  }
  console.log(`   • Inserted ${registryRows.length} games into game_registry`);

  // Insert content rows in batches (avoids payload limits on large inserts).
  const contentRows = buildContentRows();
  const BATCH = 500;
  for (let i = 0; i < contentRows.length; i += BATCH) {
    const batch = contentRows.slice(i, i + BATCH);
    const { error: contentErr } = await supabase.from("game_content").insert(batch);
    if (contentErr) {
      console.error("❌ Failed inserting game_content:", contentErr.message);
      process.exit(1);
    }
  }
  console.log(`   • Inserted ${contentRows.length} rows into game_content`);

  console.log("✅ Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
