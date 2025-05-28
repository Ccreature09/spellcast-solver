'use client';

import { SpellcastSolver } from './components/SpellcastSolver';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ Spellcast Solver
          </h1>
          <p className="text-gray-300 text-lg">
            Find all possible words in your Spellcast grid and dominate the game!
          </p>
        </header>
        <SpellcastSolver />
      </div>
    </div>
  );
}
