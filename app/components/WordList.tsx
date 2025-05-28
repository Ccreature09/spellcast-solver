'use client';

import { useState, useMemo } from 'react';
import { FoundWord } from '../types/spellcast';

interface WordListProps {
  words: FoundWord[];
  onWordSelect: (word: FoundWord) => void;
  selectedWord: FoundWord | null;
}

export function WordList({ words, onWordSelect, selectedWord }: WordListProps) {
  const [sortBy, setSortBy] = useState<'score' | 'length' | 'alphabetical'>('score');
  const [filterLength, setFilterLength] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFilteredWords = useMemo(() => {
    let filtered = words;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply length filter
    if (filterLength) {
      filtered = filtered.filter(word => word.word.length === filterLength);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'length':
          if (b.word.length !== a.word.length) {
            return b.word.length - a.word.length;
          }
          return b.score - a.score;
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        default:
          return 0;
      }
    });
  }, [words, sortBy, filterLength, searchTerm]);

  const lengthOptions = useMemo(() => {
    const lengths = [...new Set(words.map(word => word.word.length))].sort((a, b) => a - b);
    return lengths;
  }, [words]);

  const totalScore = useMemo(() => {
    return words.reduce((sum, word) => sum + word.score, 0);
  }, [words]);

  const getWordClass = (word: FoundWord): string => {
    const baseClass = "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02]";
    
    if (selectedWord && selectedWord.word === word.word) {
      return `${baseClass} bg-purple-600/70 border-purple-400 shadow-lg`;
    }
    
    if (word.score >= 20) {
      return `${baseClass} bg-yellow-600/30 border-yellow-500/50 hover:bg-yellow-600/50`;
    } else if (word.score >= 15) {
      return `${baseClass} bg-orange-600/30 border-orange-500/50 hover:bg-orange-600/50`;
    } else if (word.score >= 10) {
      return `${baseClass} bg-blue-600/30 border-blue-500/50 hover:bg-blue-600/50`;
    } else {
      return `${baseClass} bg-white/10 border-white/20 hover:bg-white/20`;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 20) return 'text-yellow-300';
    if (score >= 15) return 'text-orange-300';
    if (score >= 10) return 'text-blue-300';
    return 'text-gray-300';
  };

  return (
    <div className="space-y-4 max-h-[600px] flex flex-col">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="text-2xl font-bold text-white">{words.length}</div>
          <div className="text-sm text-gray-300">Words Found</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="text-2xl font-bold text-yellow-300">{totalScore}</div>
          <div className="text-sm text-gray-300">Total Score</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="text-2xl font-bold text-green-300">
            {words.length > 0 ? Math.round(totalScore / words.length) : 0}
          </div>
          <div className="text-sm text-gray-300">Avg Score</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* Sort and Filter Controls */}
        <div className="flex gap-2 flex-wrap">          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'length' | 'alphabetical')}
            className="px-3 py-1 bg-gray-800 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="score" className="bg-gray-800 text-white">Sort by Score</option>
            <option value="length" className="bg-gray-800 text-white">Sort by Length</option>
            <option value="alphabetical" className="bg-gray-800 text-white">Sort A-Z</option>
          </select>

          <select
            value={filterLength || ''}
            onChange={(e) => setFilterLength(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-1 bg-gray-800 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="" className="bg-gray-800 text-white">All Lengths</option>
            {lengthOptions.map(length => (
              <option key={length} value={length} className="bg-gray-800 text-white">
                {length} letters
              </option>
            ))}
          </select>

          {(searchTerm || filterLength) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterLength(null);
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Words List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {sortedAndFilteredWords.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {words.length === 0 ? (
              <>
                <div className="text-4xl mb-2">🔍</div>
                <div>Click "Solve Grid" to find words!</div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🚫</div>
                <div>No words match your filters</div>
              </>
            )}
          </div>
        ) : (          sortedAndFilteredWords.map((word, index) => (
            <div
              key={`${word.word}-${index}`}
              className={getWordClass(word)}
              onClick={() => onWordSelect(word)}
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold text-lg">{word.word}</span>
                <span className="text-sm text-gray-300">
                  ({word.word.length} letters)
                </span>
                {word.swapsUsed && word.swapsUsed.length > 0 && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                    🔄 {word.swapsUsed.length} swap{word.swapsUsed.length > 1 ? 's' : ''}
                  </span>
                )}
                {word.gemCost > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    💎 {word.gemCost}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${getScoreColor(word.score)}`}>
                  {word.score}
                </span>
                <span className="text-gray-400 text-sm">pts</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      {words.length > 0 && (
        <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-white/20">
          <div className="font-medium">Score Colors:</div>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-600 rounded"></span>
              <span>20+ pts</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-600 rounded"></span>
              <span>15+ pts</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-600 rounded"></span>
              <span>10+ pts</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-600 rounded"></span>
              <span>&lt;10 pts</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
