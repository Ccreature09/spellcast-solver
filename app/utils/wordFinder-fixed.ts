import { COMMON_WORDS } from '../data/words';
import { SpellcastGrid, FoundWord, Position, SolverSettings, SwapInfo, GridCell } from '../types/spellcast';

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

// Trie Node for efficient prefix checking and word validation
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  
  insert(word: string): void {
    let current: TrieNode = this;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }
  
  getChild(char: string): TrieNode | null {
    return this.children.get(char) || null;
  }
}

// Build trie once and reuse
let wordTrie: TrieNode | null = null;
// Score cache for performance
const scoreCache = new Map<string, number>();

function buildTrie(): TrieNode {
  if (wordTrie) return wordTrie;
  
  wordTrie = new TrieNode();
  for (const word of COMMON_WORDS) {
    wordTrie.insert(word.toUpperCase());
  }
  return wordTrie;
}

// Letter scoring based on actual Spellcast game values
const LETTER_SCORES: { [key: string]: number } = {
  'A': 1, 'B': 4, 'C': 4, 'D': 2, 'E': 1, 'F': 4, 'G': 3, 'H': 3, 'I': 1, 'J': 10,
  'K': 5, 'L': 2, 'M': 4, 'N': 2, 'O': 1, 'P': 4, 'Q': 10, 'R': 1, 'S': 1, 'T': 1,
  'U': 2, 'V': 5, 'W': 4, 'X': 8, 'Y': 3, 'Z': 10
};

function calculateScore(word: string, path: Position[], grid: SpellcastGrid, swapsUsed: SwapInfo[]): number {
  // Create cache key
  const pathKey = path.map(p => `${p.row},${p.col}`).join('|');
  const swapKey = swapsUsed.map(s => `${s.position.row},${s.position.col}:${s.newLetter}`).join(';');
  const cacheKey = `${word}|${pathKey}|${swapKey}`;
  
  // Check cache first
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey)!;
  }
  
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
  // Spellcast length bonus system (corrected based on actual game scoring)
  // Length bonus: 3 points per letter beyond 4
  const lengthBonus = Math.max(0, (word.length - 4) * 3);
  score += lengthBonus;
  
  // Subtract gem cost for swaps (don't let score go below 0)
  const gemCost = calculateGemCost(swapsUsed.length);
  score = Math.max(0, score - gemCost);
  
  const finalScore = Math.round(score);
  
  // Cache the result
  if (scoreCache.size < 10000) { // Prevent memory issues
    scoreCache.set(cacheKey, finalScore);
  }
  
  return finalScore;
}

function calculateGemCost(swapCount: number): number {
  // Each swap costs 3 gems (corrected from 5)
  return swapCount * 3;
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

// Available letters for swapping - prioritized by value and frequency
const SWAP_LETTERS = ['S', 'R', 'E', 'A', 'T', 'I', 'N', 'L', 'O', 'U', 'D', 'G', 'H', 'Y', 'C', 'M', 'P', 'B', 'F', 'W', 'K', 'V'];

// Optimized DFS with Trie navigation, early pruning, and integrated swap logic
function findWordsFromPosition(
  grid: SpellcastGrid,
  startRow: number,
  startCol: number,
  visited: boolean[][],
  currentWord: string,
  currentPath: Position[],
  foundWords: Map<string, FoundWord>,
  trieNode: TrieNode,
  settings: SolverSettings = { availableGems: 0, maxSwaps: 0, allowSwaps: false },
  currentSwaps: SwapInfo[] = [],
  currentScore: number = 0,
  wordMultiplier: number = 1,
  topScore: { value: number } = { value: 0 }
): void {
  const cell = grid[startRow][startCol];
  if (!cell || !cell.letter) return;

  const originalLetter = cell.letter.toUpperCase();
  
  // Try both original letter AND available swaps at this position
  const lettersToTry: Array<{letter: string, isSwap: boolean, swapInfo?: SwapInfo}> = [
    { letter: originalLetter, isSwap: false }
  ];
  
  // Add swap options if swaps are enabled and we have gems/swaps available
  if (settings.allowSwaps && currentSwaps.length < settings.maxSwaps) {
    const gemsNeeded = (currentSwaps.length + 1) * 3;
    if (gemsNeeded <= settings.availableGems) {
      // Check if this position already has a swap
      const existingSwap = currentSwaps.find(s => 
        s.position.row === startRow && s.position.col === startCol
      );
      
      if (!existingSwap) {
        // Add potential swap letters (limit to 3-4 best options for performance)
        const topSwapLetters = SWAP_LETTERS.slice(0, 4);
        for (const newLetter of topSwapLetters) {
          if (newLetter !== originalLetter) {
            const originalValue = LETTER_SCORES[originalLetter] || 1;
            const newValue = LETTER_SCORES[newLetter] || 1;
            
            // Only consider valuable swaps
            if (newValue >= originalValue || ['S', 'R', 'E', 'A', 'T'].includes(newLetter)) {
              lettersToTry.push({
                letter: newLetter,
                isSwap: true,
                swapInfo: {
                  position: { row: startRow, col: startCol },
                  originalLetter: cell.letter,
                  newLetter
                }
              });
            }
          }
        }
      }
    }
  }
  
  // Try each letter option (original + potential swaps)
  for (const letterOption of lettersToTry) {
    const letter = letterOption.letter;
    const newWord = currentWord + letter;
    const newPath = [...currentPath, { row: startRow, col: startCol }];
    const newSwaps = letterOption.isSwap ? [...currentSwaps, letterOption.swapInfo!] : [...currentSwaps];
    
    // Navigate to the next node in the trie - O(1) operation
    const nextNode = trieNode.getChild(letter);
    if (!nextNode) {
      // No words possible with this prefix, continue to next letter option
      continue;
    }

    // Calculate incremental score for performance
    let letterScore = LETTER_SCORES[letter] || 1;
    let newWordMultiplier = wordMultiplier;
    
    // Apply letter multipliers
    if (cell.multiplier) {
      switch (cell.multiplier) {
        case 'DL':
          letterScore *= 2;
          break;
        case 'TL':
          letterScore *= 3;
          break;
        case 'DW':
          newWordMultiplier *= 2;
          break;
        case 'TW':
          newWordMultiplier *= 3;
          break;
      }
    }
    
    const newScore = currentScore + letterScore;

    // Early pruning: if even with maximum possible remaining score we can't beat the top score
    if (newWord.length >= 6) {
      const remainingLetters = 20 - newWord.length;
      const gemCostEstimate = calculateGemCost(newSwaps.length);
      const maxPossibleFinalScore = (newScore * newWordMultiplier) + ((newWord.length + remainingLetters - 4) * 3) - gemCostEstimate;
      
      if (maxPossibleFinalScore < topScore.value * 0.7) {
        continue; // Skip this letter option
      }
    }

    // Check if current word is valid (minimum 3 letters)
    if (newWord.length >= 3 && nextNode.isEndOfWord) {
      const finalScore = (newScore * newWordMultiplier) + Math.max(0, (newWord.length - 4) * 3) - calculateGemCost(newSwaps.length);
      const roundedScore = Math.max(0, Math.round(finalScore));
      
      const existingWord = foundWords.get(newWord);
      
      if (!existingWord || roundedScore > existingWord.score) {
        foundWords.set(newWord, {
          word: newWord,
          path: newPath,
          score: roundedScore,
          multipliers: [],
          swapsUsed: [...newSwaps],
          gemCost: calculateGemCost(newSwaps.length)
        });
        
        // Update top score for pruning
        if (roundedScore > topScore.value) {
          topScore.value = roundedScore;
        }
      }
    }

    // Continue searching if word is not too long
    if (newWord.length < 20) {
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
            foundWords,
            nextNode,
            settings,
            newSwaps,
            newScore,
            newWordMultiplier,
            topScore
          );
        }
      }

      visited[startRow][startCol] = false;
    }
  }
}

// Helper function to create a grid with a swap applied
function createGridWithSwap(grid: SpellcastGrid, swap: SwapInfo): SpellcastGrid {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  newGrid[swap.position.row][swap.position.col].letter = swap.newLetter;
  return newGrid;
}

export async function findAllWords(
  grid: SpellcastGrid, 
  settings: SolverSettings = { availableGems: 0, maxSwaps: 0, allowSwaps: false }
): Promise<FoundWord[]> {
  // Safety checks
  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return [];
  }
  
  // Clear cache for new search
  scoreCache.clear();
  
  const foundWords = new Map<string, FoundWord>();
  
  // Build trie for efficient word lookup - much faster than Set
  const trie = buildTrie();
  
  // Reduced timeout due to better performance optimizations
  const startTime = Date.now();
  const TIMEOUT_MS = 3000; // 3 seconds timeout (reduced from 5 due to optimizations)

  // Shared top score tracker for early pruning
  const topScore = { value: 0 };

  try {
    // Smart starting position ordering - prioritize cells with multipliers and high-value letters
    const positions: Array<{row: number, col: number, priority: number}> = [];
    
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        const cell = grid[row][col];
        if (cell && cell.letter && cell.letter.trim() !== '') {
          let priority = LETTER_SCORES[cell.letter.toUpperCase()] || 1;
          
          // Boost priority for multiplier cells
          if (cell.multiplier) {
            switch (cell.multiplier) {
              case 'TW': priority += 50; break;
              case 'DW': priority += 30; break;
              case 'TL': priority += 20; break;
              case 'DL': priority += 10; break;
            }
          }
          
          positions.push({ row, col, priority });
        }
      }
    }
    
    // Sort by priority (highest first) to find high-scoring words early
    positions.sort((a, b) => b.priority - a.priority);

    // Try starting from each position in optimized order
    for (const pos of positions) {
      // Check timeout
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn('Word finding timed out after', TIMEOUT_MS, 'ms');
        break;
      }
      
      // Initialize fresh visited grid for each starting position
      const visited: boolean[][] = Array(grid.length)
        .fill(null)
        .map(() => Array(grid[0].length).fill(false));
      
      findWordsFromPosition(grid, pos.row, pos.col, visited, '', [], foundWords, trie, settings, [], 0, 1, topScore);
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
