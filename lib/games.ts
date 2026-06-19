import type { GameType } from "./supabase";

// Trivia subcategories — tab labels for the trivia game.
export const TRIVIA_CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "quickfire", label: "Quick Fire" },
  { id: "mc", label: "MC" },
  { id: "friends", label: "Friends" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "riddle", label: "Riddles" },
];

// Accent color used for a game's primary buttons / highlights.
export const GAME_ACCENT: Record<string, string> = {
  trivia: "#f5c842",
  wyr: "#ff6b6b",
  agree: "#6bcfff",
  beige: "#a8ff78",
  avoid: "#ff6b6b",
  vote: "#ff9f43",
  lnt: "#6bcfff",
  couples: "#ff6b6b",
  podcast: "#d97bff",
  uncomfortable: "#ff6b6b",
  categories: "#f5c842",
  password: "#6bcfff",
  overrated: "#ff9f43",
  contact: "#ff6b6b",
  twentyq: "#d97bff",
  wavelength: "#f5c842",
  fivesec: "#a8ff78",
};

export function accentFor(id: string): string {
  return GAME_ACCENT[id] ?? "#f5c842";
}

export interface RuleBlock {
  color: string;
  steps: string[];
  example?: string[];
}

// "How to Play" content shown at the top of certain game screens.
export const RULES: Record<string, RuleBlock> = {
  categories: {
    color: "#f5c842",
    steps: [
      "One person names a <strong>category</strong>.",
      "Go around the group — each person says something that fits.",
      "No repeats. No hesitating too long.",
      "If you repeat, blank, or say something wrong — you're out.",
      "Last person standing wins the round.",
    ],
  },
  password: {
    color: "#6bcfff",
    steps: [
      "Split into 2 teams. One person per team is the <strong>clue-giver</strong>.",
      "Both clue-givers see the secret <strong>Password word</strong>.",
      "Clue-givers alternate giving <strong>one-word clues</strong> to their team.",
      "Teams guess after each clue. First team to guess correctly wins the round.",
      "You cannot say any part of the password word as a clue.",
      "Play to 5 points.",
    ],
  },
  overrated: {
    color: "#ff9f43",
    steps: [
      "Read out a topic.",
      "Everyone simultaneously calls out: <strong>Overrated</strong> or <strong>Underrated</strong>.",
      "Go around and defend your answer — best argument wins the room.",
      "No right answer. Just vibes and roasting.",
    ],
  },
  contact: {
    color: "#ff6b6b",
    steps: [
      "One person (the <strong>Defender</strong>) thinks of a word and reveals the <strong>first letter</strong>.",
      "Other players think of a word starting with that letter and give a clue without saying the word.",
      'If two players think they know the same word, one says <strong>"Contact!"</strong> and they count down 3-2-1 and say the word simultaneously.',
      "If they match → the Defender must reveal the next letter.",
      "If the Defender guesses the word before they say it → Contact fails, no new letter.",
      "Keep going until someone guesses the full word — that person becomes the new Defender.",
    ],
    example: [
      'Defender thinks of <strong>MANGO</strong>, reveals "M"',
      'Player: "It\'s a piece of music" (thinking MELODY)',
      'Another player: "Contact!" → countdown → both say MELODY',
      '→ Defender reveals next letter: "MA"',
      "→ Game continues...",
    ],
  },
  twentyq: {
    color: "#d97bff",
    steps: [
      "One person thinks of a <strong>person, place, or thing</strong> — keeps it secret.",
      "Everyone else takes turns asking <strong>yes or no questions only</strong>.",
      "Max <strong>20 questions</strong> total across the group.",
      "If someone guesses correctly before 20 → they win and pick next.",
      "If no one guesses → the thinker wins and picks again.",
    ],
  },
  wavelength: {
    color: "#f5c842",
    steps: [
      "One player is the <strong>Psychic</strong> — they see where the target sits on the spectrum below.",
      "They give <strong>one word or short clue</strong> that hints at its position.",
      "The team moves the dial and locks in their guess.",
      "Score points based on how close you land.",
      "Take turns being the Psychic. First to <strong>10 points</strong> wins.",
    ],
  },
};

// Bulk-add format hint per game type, shown in the admin bulk textarea.
export function bulkHint(type: GameType): string {
  switch (type) {
    case "trivia":
      return "One per line — Question | Answer | category\n(category = quickfire, mc, friends, medium, hard, or riddle)";
    case "wavelength":
      return "One per line — Left | Right";
    case "avoid":
      return "One per line — Category | Avoid answer";
    default:
      return "One item per line.";
  }
}

export function contentLabel(type: GameType): string {
  switch (type) {
    case "trivia":
      return "Question";
    case "wavelength":
      return "Left side of spectrum";
    case "avoid":
      return "Category";
    default:
      return "Content";
  }
}
