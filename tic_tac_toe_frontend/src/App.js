import React, { useState, useEffect } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function PlayerInfo({ player, isActive }) {
  /** 
   * Player information box for horizontal layout.
   * @param {player} Object with player details
   * @param {isActive} boolean to highlight the active player
   */
  return (
    <div className={`player-info${isActive ? ' active' : ''}`}>
      <span className="player-avatar">{player.symbol}</span>
      <span className="player-name">{player.name}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameBoard({ board }) {
  /** 
   * Tic Tac Toe 3x3 Board; statically rendered for structure (real game logic later)
   * @param {board} 2D array [row][col]
   */
  return (
    <div className="game-board">
      {board.map((row, i) => (
        <div key={i} className="board-row">
          {row.map((cell, j) => (
            <div key={j} className="board-cell">{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function ActionButtons() {
  /** 
   * Action buttons beneath the board (static structure, real actions later)
   */
  return (
    <div className="action-buttons">
      <button className="btn primary">New Game</button>
      <button className="btn">Reset Board</button>
      <button className="btn">History</button>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameHistorySidebar({ history }) {
  /**
   * Sidebar listing game history.
   * @param {history} Array of game/history entries
   */
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Game History</div>
      <ul className="history-list">
        {history.map((item, idx) => (
          <li key={idx} className="history-item">{item}</li>
        ))}
      </ul>
    </aside>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Application shell for the Tic Tac Toe frontend.
   * Centers the game, provides sidebar, theme toggle, and minimal layout.
   */
  const [theme, setTheme] = useState('light');

  // Demo state for structure only
  const [board] = useState([
    [null, 'X', 'O'],
    ['O', 'X', null],
    [null, null, 'X']
  ]);
  const players = [
    { name: 'Player 1', symbol: '❌' },
    { name: 'Player 2', symbol: '⭕' }
  ];
  const [activePlayer] = useState(0);
  const [history] = useState([
    "You defeated Alice (3-2)",
    "Draw with Bob (board full)",
    "You lost to Carol (1-3)",
  ]);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="app-title">
        <span className="brand-accent">TicTacTrace</span>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <div className="main-container">
        <div className="central-content">
          <div className="players-row">
            <PlayerInfo player={players[0]} isActive={activePlayer === 0} />
            <PlayerInfo player={players[1]} isActive={activePlayer === 1} />
          </div>
          <GameBoard board={board} />
          <ActionButtons />
        </div>
        <GameHistorySidebar history={history} />
      </div>
    </div>
  );
}

export default App;
