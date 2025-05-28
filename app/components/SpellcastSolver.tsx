'use client';

import { useState, useCallback } from 'react';
import { SpellcastGrid, FoundWord, SolverSettings, GridCell } from '../types/spellcast';
import { GridInput } from './GridInput';
import { WordList } from './WordList';
import { GridDisplay } from './GridDisplay';
import { findAllWords } from '../utils/wordFinder';

export function SpellcastSolver() {
  const [grid, setGrid] = useState<SpellcastGrid>([
    [{ letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }],
    [{ letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }],
    [{ letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }],
    [{ letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }],
    [{ letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }, { letter: '' }]
  ]);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<FoundWord | null>(null);
  const [settings, setSettings] = useState<SolverSettings>({
    availableGems: 0,
    maxSwaps: 0,
    allowSwaps: false
  });

  const handleGridChange = useCallback((newGrid: SpellcastGrid) => {
    setGrid(newGrid);
    setFoundWords([]);
    setSelectedWord(null);
  }, []);
  const handleSolve = useCallback(async () => {
    setIsLoading(true);
    try {
      const words = await findAllWords(grid, settings);
      setFoundWords(words);
    } catch (error) {
      console.error('Error solving grid:', error);
    } finally {
      setIsLoading(false);
    }
  }, [grid, settings]);

  const handleWordSelect = useCallback((word: FoundWord) => {
    setSelectedWord(word);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedWord(null);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Panel - Grid Input and Display */}
      <div className="space-y-6">        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📝 Enter Your Grid</h2>
          <GridInput grid={grid} onChange={handleGridChange} />
          
          {/* Gem and Swap Controls */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  💎 Available Gems
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={settings.availableGems}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    availableGems: parseInt(e.target.value) || 0,
                    maxSwaps: Math.floor((parseInt(e.target.value) || 0) / 5), // 5 gems per swap
                    allowSwaps: (parseInt(e.target.value) || 0) > 0
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🔄 Max Swaps (5💎 each)
                </label>
                <input
                  type="number"
                  min="0"
                  max={Math.floor(settings.availableGems / 5)}
                  value={settings.maxSwaps}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maxSwaps: Math.min(parseInt(e.target.value) || 0, Math.floor(prev.availableGems / 5))
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowSwaps"
                checked={settings.allowSwaps}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  allowSwaps: e.target.checked && prev.availableGems > 0
                }))}
                className="mr-3 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="allowSwaps" className="text-white/80">
                Enable letter swapping (uses gems)
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleSolve}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? '🔍 Solving...' : '✨ Solve Grid'}
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Grid Visualization</h2>
          <GridDisplay 
            grid={grid} 
            selectedWord={selectedWord}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>

      {/* Right Panel - Words List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          📋 Found Words ({foundWords.length})
        </h2>
        <WordList 
          words={foundWords} 
          onWordSelect={handleWordSelect}
          selectedWord={selectedWord}
        />
      </div>
    </div>
  );
}
