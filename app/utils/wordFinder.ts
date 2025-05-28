import { COMMON_WORDS } from '../data/words';
import { SpellcastGrid, FoundWord, Position, SolverSettings, SwapInfo, GridCell } from '../types/spellcast';

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

function calculateScore(word: string, path: Position[], grid: SpellcastGrid, swapsUsed: SwapInfo[]): number {
  let score = 0;
  let wordMultiplier = 1;
  
  // Calculate base letter scores with multipliers
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const position = path[i];
    let letterScore = LETTER_SCORES[char.toUpperCase()] || 1;
    
    // Apply letter multipliers
    const cell = grid[position.row][position.col];
    if (cell.multiplier) {
      switch (cell.multiplier) {
        case 'DL':
          letterScore *= 2;
          break;
        case 'TL':
          letterScore *= 3;
          break;
        case 'DW':
          wordMultiplier *= 2;
          break;
        case 'TW':
          wordMultiplier *= 3;
          break;
      }
    }
    
    score += letterScore;
  }
  
  // Apply word multiplier
  score *= wordMultiplier;
  
  // Enhanced bonus system for longer words
  if (word.length >= 5) score *= 1.2;
  if (word.length >= 6) score *= 1.5;
  if (word.length >= 7) score *= 2.0;
  if (word.length >= 8) score *= 2.5;
  if (word.length >= 9) score *= 3.0;
  if (word.length >= 10) score *= 4.0;
  
  // Apply gem cost penalty (subtract gem cost from score)
  const gemCost = calculateGemCost(swapsUsed.length);
  
  return Math.round(score);
}

function calculateGemCost(swapCount: number): number {
  // Each swap costs gems (could be 1, 5, 10, etc. - adjust based on game mechanics)
  return swapCount * 5; // Assuming 5 gems per swap
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

// Build prefix trie for faster prefix checking
function buildPrefixSet(words: Set<string>): Set<string> {
  const prefixes = new Set<string>();
  for (const word of words) {
    for (let i = 1; i <= word.length; i++) {
      prefixes.add(word.substring(0, i));
    }
  }
  return prefixes;
}

function findWordsFromPosition(
  grid: SpellcastGrid,
  startRow: number,
  startCol: number,
  visited: boolean[][],
  currentWord: string,
  currentPath: Position[],
  words: Set<string>,
  foundWords: Map<string, FoundWord>,
  prefixSet: Set<string>,
  settings: SolverSettings = { availableGems: 0, maxSwaps: 0, allowSwaps: false },
  currentSwaps: SwapInfo[] = []
): void {
  const cell = grid[startRow][startCol];
  if (!cell || !cell.letter) return;

  const letter = cell.letter;
  const newWord = currentWord + letter;
  const newPath = [...currentPath, { row: startRow, col: startCol }];
  const upperWord = newWord.toUpperCase();
  
  // Early termination: if no words start with this prefix, stop searching
  if (newWord.length >= 2 && !prefixSet.has(upperWord)) {
    return;
  }

  // Additional optimization: for very long words, check if prefix is getting too specific
  if (newWord.length >= 8) {
    // Count how many words still match this prefix
    let matchCount = 0;
    for (const word of words) {
      if (word.startsWith(upperWord)) {
        matchCount++;
        if (matchCount > 2) break; // If we have more than 2 matches, continue
      }
    }
    if (matchCount === 0) return; // No matches, stop
    if (matchCount === 1 && !words.has(upperWord)) return; // Only one match and it's not a complete word
  }

  // Check if current word is valid (minimum 3 letters)
  if (newWord.length >= 3 && words.has(upperWord)) {
    const gemCost = calculateGemCost(currentSwaps.length);
    const score = calculateScore(newWord, newPath, grid, currentSwaps);
    const existingWord = foundWords.get(upperWord);
    
    if (!existingWord || score > existingWord.score) {
      foundWords.set(upperWord, {
        word: upperWord,
        path: newPath,
        score,
        multipliers: [],
        swapsUsed: [...currentSwaps],
        gemCost
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
          foundWords,
          prefixSet,
          settings,
          currentSwaps
        );
      }
    }

    visited[startRow][startCol] = false;
  }
}

// Available letters that can be swapped to (common letters)
const SWAP_LETTERS = ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T', 'L', 'N'];

// Function to find words with swap combinations
async function findWordsWithSwaps(
  grid: SpellcastGrid,
  startRow: number,
  startCol: number,
  visited: boolean[][],
  currentWord: string,
  currentPath: Position[],
  words: Set<string>,
  foundWords: Map<string, FoundWord>,
  prefixSet: Set<string>,
  settings: SolverSettings,
  currentSwaps: SwapInfo[] = []
): Promise<void> {
  const maxSwaps = Math.min(settings.maxSwaps, Math.floor(settings.availableGems / 5)); // Assuming 5 gems per swap
  
  if (currentSwaps.length >= maxSwaps) {
    // Continue with normal search without more swaps
    findWordsFromPosition(grid, startRow, startCol, visited, currentWord, currentPath, words, foundWords, prefixSet, settings, currentSwaps);
    return;
  }

  // Try original letter
  findWordsFromPosition(grid, startRow, startCol, visited, currentWord, currentPath, words, foundWords, prefixSet, settings, currentSwaps);
  
  // Try swapping current position to different letters
  const originalCell = grid[startRow][startCol];
  for (const newLetter of SWAP_LETTERS) {
    if (newLetter !== originalCell.letter.toUpperCase()) {
      // Create a new swap
      const swapInfo: SwapInfo = {
        position: { row: startRow, col: startCol },
        originalLetter: originalCell.letter,
        newLetter
      };
      
      // Create modified grid with swap
      const modifiedGrid = createGridWithSwap(grid, swapInfo);
      
      // Continue search with modified grid and updated swaps
      const newSwaps = [...currentSwaps, swapInfo];
      findWordsFromPosition(modifiedGrid, startRow, startCol, visited, currentWord, currentPath, words, foundWords, prefixSet, settings, newSwaps);
    }
  }
}

// Helper function to create a grid with a swap applied
function createGridWithSwap(grid: SpellcastGrid, swap: SwapInfo): SpellcastGrid {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  newGrid[swap.position.row][swap.position.col].letter = swap.newLetter;
  return newGrid;
}

// Helper function to check if a swap already exists at a position
function hasSwapAtPosition(swaps: SwapInfo[], position: Position): boolean {
  return swaps.some(swap => 
    swap.position.row === position.row && swap.position.col === position.col
  );
}

export async function findAllWords(
  grid: SpellcastGrid, 
  settings: SolverSettings = { availableGems: 0, maxSwaps: 0, allowSwaps: false }
): Promise<FoundWord[]> {
  // Safety checks
  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return [];
  }
  const foundWords = new Map<string, FoundWord>();
  const words = new Set<string>(COMMON_WORDS);
  
  // Build prefix set for faster prefix checking
  const prefixSet = buildPrefixSet(words);
  
  // Add timeout to prevent hanging (increased for longer word search)
  const startTime = Date.now();
  const TIMEOUT_MS = 8000; // 8 seconds timeout for longer words

  try {
    // Try starting from each position
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        // Check timeout
        if (Date.now() - startTime > TIMEOUT_MS) {
          console.warn('Word finding timed out after', TIMEOUT_MS, 'ms');
          break;
        }
        
        const cell = grid[row][col];
        if (cell && cell.letter && cell.letter.trim() !== '') {
          // Initialize fresh visited grid for each starting position
          const visited: boolean[][] = Array(grid.length)
            .fill(null)
            .map(() => Array(grid[0].length).fill(false));
          
          findWordsFromPosition(grid, row, col, visited, '', [], words, foundWords, prefixSet, settings);
          
          // If swaps are allowed, also try with swaps
          if (settings.allowSwaps && settings.availableGems > 0) {
            await findWordsWithSwaps(grid, row, col, visited, '', [], words, foundWords, prefixSet, settings);
          }
        }
      }
      
      // Check timeout at row level too
      if (Date.now() - startTime > TIMEOUT_MS) {
        break;
      }
    }

    // Convert Map to Array and sort by score (highest first) and then by word length
    const resultsArray = Array.from(foundWords.values());
    return resultsArray.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.word.length - a.word.length;
    });
  } catch (error) {
    console.error('Error in findAllWords:', error);
    return [];
  }
}
