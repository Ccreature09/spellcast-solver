'use client';

import { SpellcastGrid, FoundWord } from '../types/spellcast';

interface GridDisplayProps {
  grid: SpellcastGrid;
  selectedWord: FoundWord | null;
  onClearSelection: () => void;
}

export function GridDisplay({ grid, selectedWord, onClearSelection }: GridDisplayProps) {
  const isPositionInPath = (row: number, col: number): boolean => {
    if (!selectedWord) return false;
    return selectedWord.path.some(pos => pos.row === row && pos.col === col);
  };

  const getPositionInPath = (row: number, col: number): number => {
    if (!selectedWord) return -1;
    return selectedWord.path.findIndex(pos => pos.row === row && pos.col === col);
  };
  const getCellClasses = (row: number, col: number): string => {
    const baseClasses = "w-16 h-16 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all duration-300 relative";
    const cell = grid[row][col];
    
    // Add multiplier styling
    let multiplierClasses = '';
    if (cell?.multiplier) {
      switch (cell.multiplier) {
        case 'DL':
          multiplierClasses = 'ring-2 ring-blue-400';
          break;
        case 'TL':
          multiplierClasses = 'ring-2 ring-blue-600';
          break;
        case 'DW':
          multiplierClasses = 'ring-2 ring-orange-400';
          break;
        case 'TW':
          multiplierClasses = 'ring-2 ring-red-500';
          break;
      }
    }
    
    if (isPositionInPath(row, col)) {
      const position = getPositionInPath(row, col);
      const isStart = position === 0;
      const isEnd = position === selectedWord!.path.length - 1;
      
      if (isStart) {
        return `${baseClasses} bg-green-500 border-green-300 text-white scale-110 shadow-lg ${multiplierClasses}`;
      } else if (isEnd) {
        return `${baseClasses} bg-red-500 border-red-300 text-white scale-110 shadow-lg ${multiplierClasses}`;
      } else {
        return `${baseClasses} bg-yellow-500 border-yellow-300 text-white scale-105 shadow-md ${multiplierClasses}`;
      }
    }
    
    return `${baseClasses} bg-white/20 border-white/30 text-white hover:bg-white/30 ${multiplierClasses}`;
  };

  const getPathNumber = (row: number, col: number): string => {
    if (!selectedWord) return '';
    const position = getPositionInPath(row, col);
    return position >= 0 ? (position + 1).toString() : '';
  };

  return (
    <div className="space-y-4">
      {selectedWord && (
        <div className="flex items-center justify-between p-3 bg-purple-600/50 rounded-lg border border-purple-400/50">
          <div>
            <span className="text-white font-bold text-lg">{selectedWord.word}</span>
            <span className="text-purple-200 ml-2">({selectedWord.score} points)</span>
          </div>
          <button
            onClick={onClearSelection}
            className="text-purple-200 hover:text-white transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      )}      <div className="grid grid-cols-5 gap-2 p-4 bg-white/10 rounded-xl border border-white/20">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClasses(rowIndex, colIndex)}
            >
              <div className="relative">
                <span className="text-center">{cell?.letter || '•'}</span>
                {cell?.multiplier && (
                  <span className="absolute top-0 left-0 text-xs font-semibold text-white/80">
                    {cell.multiplier}
                  </span>
                )}
                {isPositionInPath(rowIndex, colIndex) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {getPathNumber(rowIndex, colIndex)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedWord && (
        <div className="text-sm text-gray-300 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded"></span>
            <span>Start position</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-500 rounded"></span>
            <span>Path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded"></span>
            <span>End position</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">1</span>
            <span>Step number</span>
          </div>
        </div>
      )}
    </div>
  );
}
