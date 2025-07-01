import React, { useState, useEffect } from 'react';
import './App.css';

// Import modular feature components
import LoginSignup from './components/LoginSignup';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import GameOverScreen from './components/GameOverScreen';
import GameHistorySidebar from './components/GameHistorySidebar';



/**
 * Application shell for Tic Tac Toe frontend.
 * Now uses modular components: LoginSignup, Lobby, GameBoard, GameOverScreen, GameHistorySidebar
 */
function App() {
  // App-level view state
  const [theme, setTheme] = useState('light');
  const [username, setUsername] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'lobby', 'game', 'gameover'
  const [games, setGames] = useState([
    // Demo game lobbies
    { id: 1, name: "Room123", host: "Alice", status: "waiting" },
    { id: 2, name: "ProTic", host: "Bob", status: "in_progress" }
  ]);
  const [yourSymbol, setYourSymbol] = useState("X");
  const [opponent, setOpponent] = useState("Bob");
  const [board, setBoard] = useState([
    [null, 'X', 'O'],
    ['O', 'X', null],
    [null, null, 'X']
  ]);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null); // "X" or "O"
  const [isDraw, setIsDraw] = useState(false);

  // Demo history for sidebar
  const [history, setHistory] = useState([
    { opponent: "Alice", result: "Win", date: "2024-04-01" },
    { opponent: "Bob", result: "Draw", date: "2024-04-02" },
    { opponent: "Carol", result: "Loss", date: "2024-04-03" },
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handler: Theme toggle
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Handler: On login/signup
  const handleLogin = (uname) => {
    setUsername(uname);
    setView('lobby');
  };

  // Handler: Create new game
  const handleCreateGame = (roomName) => {
    const newId = Math.floor(Math.random() * 99999);
    setGames(g => [...g, { id: newId, name: roomName, host: username, status: "waiting" }]);
    setView('game');
    setYourSymbol("X");
    setOpponent("Awaiting Opponent");
    setBoard([
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]);
    setCurrentPlayer("X");
    setGameOver(false); setWinner(null); setIsDraw(false);
  };

  // Handler: Join game
  const handleJoinGame = (gameId) => {
    setView('game');
    setYourSymbol("O");
    const g = games.find(game => game.id === gameId);
    setOpponent(g ? g.host : "X-player");
    setBoard([
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]);
    setCurrentPlayer("X");
    setGameOver(false); setWinner(null); setIsDraw(false);
  };

  // Handler: Move input (for demo only)
  const handleMove = (i, j) => {
    if (gameOver || board[i][j]) return;
    const newBoard = board.map(row => row.slice());
    newBoard[i][j] = currentPlayer;
    setBoard(newBoard);
    // fake rules for demo: next player, set gameOver if full
    const nextPlayer = currentPlayer === "X" ? "O" : "X";
    setCurrentPlayer(nextPlayer);
    if (newBoard.flat().filter(Boolean).length >= 5) {
      setGameOver(true);
      // fake outcome for demo
      setWinner(currentPlayer);
    }
  };

  // Handler: Go to Lobby
  const goToLobby = () => setView('lobby');

  // Handler: New Game from Game Over
  const handleRematch = () => {
    setBoard([
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]);
    setCurrentPlayer("X");
    setGameOver(false);
    setWinner(null);
    setIsDraw(false);
    setView('game');
  };

  // Handler: Select game in history (no-op demo)
  const handleSelectHistory = (game) => {
    // could show a modal with moves
    alert(`Viewing game: ${game.result} vs ${game.opponent} (${game.date})`);
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
      {/* Routing between features */}
      {view === 'login' && (
        <LoginSignup onLogin={handleLogin} />
      )}
      {view === 'lobby' && (
        <Lobby
          games={games}
          joinGame={handleJoinGame}
          createGame={handleCreateGame}
          username={username}
        />
      )}
      {view === 'game' && (
        <div className="main-container">
          <div className="central-content">
            <div className="players-row">
              <div className={`player-info${currentPlayer === yourSymbol ? ' active' : ''}`}>
                <span className="player-avatar">{yourSymbol === 'X' ? '❌' : '⭕'}</span>
                <span className="player-name">{username} (You)</span>
              </div>
              <div className={`player-info${currentPlayer !== yourSymbol ? ' active' : ''}`}>
                <span className="player-avatar">{yourSymbol === 'X' ? '⭕' : '❌'}</span>
                <span className="player-name">{opponent}</span>
              </div>
            </div>
            <GameBoard
              board={board}
              onMove={handleMove}
              disabled={gameOver || currentPlayer !== yourSymbol}
              currentPlayer={currentPlayer}
              yourSymbol={yourSymbol}
            />
            <div className="action-buttons">
              <button className="btn" onClick={handleRematch}>Reset Board</button>
              <button className="btn" onClick={goToLobby} >Lobby</button>
            </div>
          </div>
          <GameHistorySidebar history={history} onSelectGame={handleSelectHistory} />
          {gameOver &&
            <GameOverScreen
              winner={winner}
              isDraw={isDraw}
              yourSymbol={yourSymbol}
              onNewGame={handleRematch}
              onLobby={goToLobby}
            />
          }
        </div>
      )}
    </div>
  );
}

export default App;
