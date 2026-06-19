import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if ((!url || !anonKey) && typeof window !== "undefined") {
  // Loud warning in the browser if the deploy is misconfigured.
  console.error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Fall back to harmless placeholders so `next build` never crashes when env
// vars are absent. Real requests still require valid values at runtime.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  { auth: { persistSession: false } }
);

export type GameType =
  | "simple"
  | "trivia"
  | "avoid"
  | "wavelength"
  | "fivesec"
  | "rules";

export interface GameRegistryRow {
  id: string;
  emoji: string;
  name: string;
  type: GameType;
  is_custom: boolean;
  sort_order: number;
  created_at?: string;
}

export interface GameContentRow {
  id: string;
  game_id: string;
  content: string;
  content_b: string | null;
  category: string | null;
  answer: string | null;
  sort_order: number;
  created_at?: string;
}
