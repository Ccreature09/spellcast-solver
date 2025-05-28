'use client';

import { useState, useCallback } from 'react';
import { SpellcastGrid, GridCell } from '../types/spellcast';

interface GridInputProps {
  grid: SpellcastGrid;
  onChange: (grid: SpellcastGrid) => void;
}

export function GridInput({ grid, onChange }: GridInputProps) {
  const [inputText, setInputText] = useState('');

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const newGrid = grid.map((r, i) => 
      r.map((c, j) => i === row && j === col ? { ...c, letter: value.toUpperCase() } : c)
    );
    onChange(newGrid);
  }, [grid, onChange]);

  const handleMultiplierChange = useCallback((row: number, col: number, multiplier: string) => {
    const newGrid = grid.map((r, i) => 
      r.map((c, j) => i === row && j === col ? { 
        ...c, 
        multiplier: multiplier === 'none' ? undefined : multiplier as any
      } : c)
    );
    onChange(newGrid);
  }, [grid, onChange]);

  const handleTextInput = useCallback((text: string) => {
    setInputText(text);
    const letters = text.replace(/[^A-Za-z]/g, '').toUpperCase().split('');
    const newGrid: SpellcastGrid = Array(5).fill(null).map(() => 
      Array(5).fill(null).map(() => ({ letter: '' }))
    );
    
    let index = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (index < letters.length) {
          newGrid[row][col].letter = letters[index];
          index++;
        }
      }
    }
    onChange(newGrid);
  }, [onChange]);
  const handleRandomGrid = useCallback(() => {
    const commonLetters = 'AEIOURSTLNDHCMFPGWYBUKVJXQZ';
    const weights = [8, 7, 6, 5, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    
    const newGrid: SpellcastGrid = Array(5).fill(null).map(() => 
      Array(5).fill(null).map(() => ({ letter: '' }))
    );
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const randomWeight = Math.random() * weights.reduce((a, b) => a + b, 0);
        let currentWeight = 0;
        let selectedLetter = 'A';
        
        for (let i = 0; i < commonLetters.length; i++) {
          currentWeight += weights[i] || 1;
          if (randomWeight <= currentWeight) {
            selectedLetter = commonLetters[i];
            break;
          }
        }
        
        newGrid[row][col].letter = selectedLetter;
      }
    }
    onChange(newGrid);
  }, [onChange]);

  const clearGrid = useCallback(() => {
    const newGrid: SpellcastGrid = Array(5).fill(null).map(() => 
      Array(5).fill(null).map(() => ({ letter: '' }))
    );
    onChange(newGrid);
    setInputText('');
  }, [onChange]);

  return (
    <div className="space-y-4">
      {/* Text Input Method */}
      <div>
        <label className="block text-white font-medium mb-2">
          Quick Input (25 letters):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => handleTextInput(e.target.value)}
            placeholder="Enter 25 letters (e.g., ABCDEFGHIJKLMNOPQRSTUVWXY)"
            className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
            maxLength={25}
          />
        </div>
      </div>      {/* Grid Input */}
      <div>
        <label className="block text-white font-medium mb-2">
          Grid (5x5):
        </label>
        <div className="grid grid-cols-5 gap-1 p-4 bg-white/10 rounded-lg border border-white/20">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="flex flex-col gap-1">
                <input
                  type="text"
                  value={cell.letter}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-bold bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30"
                  maxLength={1}
                />                <select
                  value={cell.multiplier || 'none'}
                  onChange={(e) => handleMultiplierChange(rowIndex, colIndex, e.target.value)}
                  className="w-12 text-xs bg-gray-800 border border-white/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="none" className="bg-gray-800 text-white">-</option>
                  <option value="DL" className="bg-gray-800 text-white">DL</option>
                  <option value="TL" className="bg-gray-800 text-white">TL</option>
                  <option value="DW" className="bg-gray-800 text-white">DW</option>
                  <option value="TW" className="bg-gray-800 text-white">TW</option>
                </select>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRandomGrid}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          🎲 Random Grid
        </button>
        <button
          onClick={clearGrid}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}
