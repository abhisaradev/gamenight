import { supabase, GameRegistryRow, GameContentRow } from "./supabase";

export interface GameWithCount extends GameRegistryRow {
  count: number;
}

export async function getGamesWithCounts(): Promise<GameWithCount[]> {
  const { data: games, error } = await supabase
    .from("game_registry")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  const registry = (games ?? []) as GameRegistryRow[];

  // Fetch all content ids once, tally counts per game in memory.
  const { data: content } = await supabase.from("game_content").select("game_id");
  const counts = new Map<string, number>();
  (content ?? []).forEach((r: { game_id: string }) => {
    counts.set(r.game_id, (counts.get(r.game_id) ?? 0) + 1);
  });

  return registry.map((g) => ({ ...g, count: counts.get(g.id) ?? 0 }));
}

export async function getGame(id: string): Promise<GameRegistryRow | null> {
  const { data, error } = await supabase
    .from("game_registry")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as GameRegistryRow) ?? null;
}

export async function getContent(gameId: string): Promise<GameContentRow[]> {
  const { data, error } = await supabase
    .from("game_content")
    .select("*")
    .eq("game_id", gameId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as GameContentRow[];
}
