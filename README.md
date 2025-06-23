# ✨ Spellcast Solver

A powerful web application that helps you find all possible words in Discord's Spellcast game grid. Built with Next.js, TypeScript, and Tailwind CSS for a modern, responsive experience.

![Spellcast Solver Screenshot](https://github.com/user-attachments/assets/spellcast-solver-preview.png)

## 🎮 What is Spellcast?

Spellcast is a popular word game available on Discord where players find words in a 5x5 grid of letters. This solver helps you:
- Find all possible words in any given grid
- Calculate optimal scores with multipliers
- Plan strategic moves with swap functionality
- Maximize your points and dominate the leaderboard

## ✨ Features

### 🔍 Smart Word Finding
- **Advanced Algorithm**: Uses a Trie data structure for efficient word searching
- **Path Visualization**: See the exact path for each word on the grid
- **Real-time Results**: Instant word finding as you type

### 🎯 Scoring System
- **Accurate Scoring**: Implements the actual Spellcast letter values
- **Multiplier Support**: Handles Double/Triple Letter and Word multipliers
- **Score Optimization**: Words are sorted by highest score first

### 🔄 Advanced Features
- **Letter Swapping**: Plan optimal moves with gem-based letter swaps
- **Multiplier Grid**: Visual representation of bonus tiles
- **Mobile Responsive**: Works perfectly on all devices
- **Modern UI**: Beautiful gradient design with smooth animations

### 📊 Word Analysis
- **Comprehensive Results**: Shows word, score, path, and multipliers used
- **Interactive Grid**: Click on words to highlight their path
- **Performance Optimized**: Handles large word lists efficiently

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/spellcast-solver.git
   cd spellcast-solver
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 How to Use

### Basic Usage
1. **Enter Letters**: Click on each cell in the 5x5 grid and type the letters from your Spellcast game
2. **Add Multipliers**: Click the multiplier buttons (DL, TL, DW, TW) to mark bonus tiles
3. **Solve**: Click the "Find Words" button to discover all possible words
4. **Explore Results**: Browse the sorted list of words and click on any word to see its path highlighted on the grid

### Advanced Features
- **Letter Swaps**: Enable the swap feature and set your available gems to see words possible with letter changes
- **Score Optimization**: Words are automatically sorted by score to help you find the highest-value plays
- **Path Visualization**: Each word shows the exact sequence of moves needed

## 🛠️ Technical Details

### Architecture
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for modern UI
- **State Management**: React hooks for efficient state handling

### Core Algorithm
- **Trie Data Structure**: Efficient prefix-based word searching
- **Depth-First Search**: Explores all possible paths through the grid
- **Memoization**: Caches results for improved performance
- **Path Tracking**: Records exact move sequences for each word

### Project Structure
```
spellcast-solver/
├── app/
│   ├── components/         # React components
│   │   ├── SpellcastSolver.tsx    # Main solver component
│   │   ├── GridInput.tsx          # Grid input interface
│   │   ├── GridDisplay.tsx        # Visual grid display
│   │   └── WordList.tsx           # Results display
│   ├── data/              # Word dictionary
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Core algorithms
│   └── globals.css        # Global styles
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Bug Reports**: Found an issue? Open a GitHub issue
2. **Feature Requests**: Have an idea? We'd love to hear it
3. **Code Contributions**: Submit a pull request
4. **Word Dictionary**: Help expand the word list

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Discord for creating the amazing Spellcast game
- The open-source community for inspiration and tools
- All contributors who help improve this solver

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/spellcast-solver/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/spellcast-solver/discussions)

---

**Happy word hunting! 🎯**
