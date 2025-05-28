export type SpellcastGrid = GridCell[][];

export interface Position {
  row: number;
  col: number;
}

export interface FoundWord {
  word: string;
  path: Position[];
  score: number;
  multipliers: string[];
  swapsUsed: SwapInfo[];
  gemCost: number;
}

export interface SwapInfo {
  position: Position;
  originalLetter: string;
  newLetter: string;
}

export interface SolverSettings {
  availableGems: number;
  maxSwaps: number;
  allowSwaps: boolean;
}

export interface LetterMultiplier {
  type: 'DL' | 'TL' | 'DW' | 'TW'; // Double Letter, Triple Letter, Double Word, Triple Word
  position: Position;
}

export interface GridCell {
  letter: string;
  multiplier?: LetterMultiplier['type'];
}
