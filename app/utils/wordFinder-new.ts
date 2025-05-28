import { COMMON_WORDS } from '../data/words';
import { SpellcastGrid, FoundWord, Position } from '../types/spellcast';

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

// Letter scoring based on Scrabble-like system
const LETTER_SCORES: { [key: string]: number } = {
  'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
  'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1, 'S': 1, 'T': 1,
  'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
};

function calculateScore(word: string, path: Position[]): number {
  let score = 0;
  for (const char of word) {
    score += LETTER_SCORES[char.toUpperCase()] || 1;
  }
  // Enhanced bonus system for longer words
  if (word.length >= 5) score *= 1.2;
  if (word.length >= 6) score *= 1.5;
  if (word.length >= 7) score *= 2.0;
  if (word.length >= 8) score *= 2.5;
  if (word.length >= 9) score *= 3.0;
  if (word.length >= 10) score *= 4.0;
  return Math.round(score);
}

function isValidPosition(row: number, col: number, grid: SpellcastGrid, visited: boolean[][]): boolean {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    return false;
  }
  if (visited[row][col]) {
    return false;
  }
  const cell = grid[row][col];
  return cell != null && Boolean(cell.letter) && cell.letter.trim() !== '';
}

function findWordsFromPosition(
  grid: SpellcastGrid,
  startRow: number,
  startCol: number,
  visited: boolean[][],
  currentWord: string,
  currentPath: Position[],
  words: Set<string>,
  foundWords: FoundWord[]
): void {
  // Safety checks
  if (!grid || !visited || startRow < 0 || startRow >= grid.length || 
      startCol < 0 || startCol >= grid[0].length || visited[startRow][startCol]) {
    return;
  }
  const cell = grid[startRow][startCol];
  if (!cell || !cell.letter || cell.letter.trim() === '') return;

  // Prevent infinite recursion
  if (currentWord.length >= 20) return;

  const newWord = currentWord + cell.letter.toUpperCase();
  const newPath = [...currentPath, { row: startRow, col: startCol }];

  // Check if current word is valid (minimum 3 letters)
  if (newWord.length >= 3 && words.has(newWord)) {
    // Check if we haven't already found this word
    const existingWord = foundWords.find(w => w.word === newWord);
    
    if (!existingWord) {
      const score = calculateScore(newWord, newPath);
      foundWords.push({
        word: newWord,
        path: newPath,
        score,
        multipliers: [],
        swapsUsed: [],
        gemCost: 0
      });
    }
  }
  // Continue searching if word is not too long (allow up to 12 characters for longer words)
  if (newWord.length < 12) {
    visited[startRow][startCol] = true;

    for (const [dx, dy] of DIRECTIONS) {
      const newRow = startRow + dx;
      const newCol = startCol + dy;

      if (isValidPosition(newRow, newCol, grid, visited)) {
        findWordsFromPosition(
          grid,
          newRow,
          newCol,
          visited,
          newWord,
          newPath,
          words,
          foundWords
        );
      }
    }

    visited[startRow][startCol] = false;
  }
}

export async function findAllWords(grid: SpellcastGrid): Promise<FoundWord[]> {
  // Safety checks
  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return [];
  }

  const foundWords: FoundWord[] = [];
  const words = new Set<string>(COMMON_WORDS);

  try {
    // Try starting from each position
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        const cell = grid[row][col];
        if (cell && cell.letter && cell.letter.trim() !== '') {
          // Initialize fresh visited grid for each starting position
          const visited: boolean[][] = Array(grid.length)
            .fill(null)
            .map(() => Array(grid[0].length).fill(false));
          
          findWordsFromPosition(grid, row, col, visited, '', [], words, foundWords);
        }
      }
    }

    // Remove duplicates and sort by score (highest first) and then by word length
    const uniqueWords = foundWords.filter((word, index, self) => 
      index === self.findIndex(w => w.word === word.word)
    );

    return uniqueWords.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.word.length - a.word.length;
    });
  } catch (error) {
    console.error('Error in findAllWords:', error);
    return [];
  }
}
