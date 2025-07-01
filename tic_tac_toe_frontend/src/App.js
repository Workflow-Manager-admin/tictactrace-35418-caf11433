import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import LoginSignup from './components/LoginSignup';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import GameOverScreen from './components/GameOverScreen';
import GameHistorySidebar from './components/GameHistorySidebar';
import * as api from './helpers/api';

function App() {
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('login');
  const [username, setUsername] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState('');

  const [gameId, setGameId] = useState(null);
  const [yourSymbol, setYourSymbol] = useState(null);
  const [opponent, setOpponent] = useState('');
  const [board, setBoard] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [moveError, setMoveError] = useState('');
  const [waiting, setWaiting] = useState(false);

  const wsCloseRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch game lobbies on lobby view
  useEffect(() => {
    if (view === 'lobby' && username) {
      setLoadingGames(true);
      setGamesError('');
      api.fetchAvailableGames()
        .then(res => setGames(res.games || res))
        .catch(e => setGamesError(e.message || 'Failed to fetch games'))
        .finally(() => setLoadingGames(false));
      setLoadingHistory(true);
      api.fetchGameHistory(username)
        .then(hist => setHistory(hist.history || hist))
        .catch(e => setHistoryError(e.message || 'Failed to fetch history'))
        .finally(() => setLoadingHistory(false));
    }
  }, [view, username]);

  // Clean up WebSocket if game ends or leaves
  useEffect(() => {
    return () => {
      if (wsCloseRef.current) wsCloseRef.current();
      wsCloseRef.current = null;
    };
  }, [gameId, view]);

  // Handler: Theme toggle
  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

  // Handler: On login/signup
  const handleLogin = async (uname) => {
    try {
      await api.loginOrSignup(uname, false);
      setUsername(uname);
      setView('lobby');
    } catch (e) {
      window.alert('Login failed: ' + e.message);
    }
  };

  // Handler: Create new game
  const handleCreateGame = async (roomName) => {
    setWaiting(true);
    try {
      const result = await api.createGame(username, roomName);
      setGameId(result.game_id || result.id || result.gameId);
      setYourSymbol("X");
      setOpponent('Awaiting Opponent');
      setBoard(result.board || [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]);
      setCurrentPlayer("X");
      setGameOver(false); setWinner(null); setIsDraw(false);
      setView('game');
      setWaiting(false);
      setupRealtime(result.game_id || result.id || result.gameId, "X");
    } catch (e) {
      window.alert("Failed to create game: " + e.message);
      setWaiting(false);
    }
  };

  // Handler: Join game
  const handleJoinGame = async (gameToJoin) => {
    setWaiting(true);
    try {
      const chosenId = typeof gameToJoin === "object" ? gameToJoin.id : gameToJoin;
      const result = await api.joinGame(username, chosenId);
      setGameId(chosenId);
      setYourSymbol("O");
      setOpponent(result.host || result.opponent || 'X-player');
      setBoard(result.board || [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]);
      setCurrentPlayer("X");
      setGameOver(false); setWinner(null); setIsDraw(false);
      setView('game');
      setWaiting(false);
      setupRealtime(chosenId, "O");
    } catch (e) {
      window.alert("Failed to join game: " + e.message);
      setWaiting(false);
    }
  };

  // Handler: Make a move
  const handleMove = async (i, j) => {
    setMoveError('');
    if (gameOver || !board || board[i][j] || currentPlayer !== yourSymbol || waiting) return;
    setWaiting(true);
    try {
      const res = await api.submitMove(gameId, username, i, j);
      // If using WebSocket, board will update there; fallback: update manually
      if (!res.fromWebSocket) {
        if (res.board) setBoard(res.board);
        if (typeof res.currentPlayer !== "undefined") setCurrentPlayer(res.currentPlayer);
        if (typeof res.winner !== "undefined") setWinner(res.winner);
        if (typeof res.isDraw !== "undefined") setIsDraw(res.isDraw);
        setGameOver(res.isDraw || !!res.winner);
      }
      setWaiting(false);
    } catch (e) {
      setMoveError(e.message || "Move failed");
      setWaiting(false);
    }
  };

  // Handler: Go to Lobby (ends live updates)
  const goToLobby = () => {
    setView('lobby');
    setGameId(null);
    setYourSymbol(null);
    setOpponent('');
    setBoard(null);
    setCurrentPlayer(null);
    setGameOver(false);
    setWinner(null);
    setIsDraw(false);
    if (wsCloseRef.current) wsCloseRef.current();
    wsCloseRef.current = null;
  };

  // Handler: New Game from Game Over (rematch: just go to lobby, can extend for true rematch)
  const handleRematch = () => {
    goToLobby();
  };

  // Handler: Select game in history to see details or replay (optional)
  const handleSelectHistory = useCallback((game) => {
    window.alert(`Viewing game vs ${game.opponent}, result: ${game.result}, on ${game.date}`);
  }, []);

  // Setup WebSocket for real-time updates to board/game
  const setupRealtime = useCallback((id, symbol) => {
    if (wsCloseRef.current) wsCloseRef.current();
    wsCloseRef.current = api.subscribeToGame(
      id,
      update => {
        setBoard(update.board);
        setCurrentPlayer(update.currentPlayer);
        setGameOver(update.isDraw || !!update.winner);
        setWinner(update.winner ?? null);
        setIsDraw(update.isDraw || false);
        // update opponent if missing
        if (update.players && update.players.length === 2) {
          const opp = update.players.find((p) => p !== username);
          if (opp) setOpponent(opp);
        }
      },
      err => {
        setMoveError("Socket error: " + err.message);
      }
    );
  }, [username]);

  // When entering a game view (gameId set), fetch (if not via create/join)
  useEffect(() => {
    if (view === 'game' && gameId && !board) {
      api.fetchGame(gameId)
        .then(g =>
          setBoard(g.board)
        )
        .catch(() => {});
      setupRealtime(gameId, yourSymbol);
    }
    // eslint-disable-next-line
  }, [view, gameId, yourSymbol]);

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
      {view === 'login' && (
        <LoginSignup onLogin={handleLogin} />
      )}
      {view === 'lobby' && (
        <div>
          {/* Games & history loading overlays */}
          {loadingGames && (
            <div
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(33, 150, 243, 0.14)',
                color: 'var(--brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 15,
                fontSize: '1.1em',
                fontWeight: 600,
                letterSpacing: '1px'
              }}
              aria-busy="true"
              aria-live="polite"
              role="status"
              tabIndex={0}
            >
              Loading available games...
            </div>
          )}
          {gamesError && (
            <div
              style={{
                padding: '6px 20px',
                color: 'var(--accent)',
                background: 'rgba(255,87,34,0.10)',
                fontWeight: 600,
                borderRadius: 9,
                margin: '16px auto',
                textAlign: 'center',
                maxWidth: 450
              }}
              role="alert"
              aria-live="assertive"
              tabIndex={0}
            >
              {gamesError}
            </div>
          )}
          <Lobby
            games={games}
            joinGame={handleJoinGame}
            createGame={handleCreateGame}
            username={username}
          />
          {loadingHistory && (
            <div
              style={{
                position: 'fixed',
                left: 0,
                bottom: 0,
                width: '100vw',
                textAlign: 'center',
                color: 'var(--primary)',
                fontSize: '0.94em',
                zIndex: 9,
              }}
              aria-busy="true"
              aria-live="polite"
            >
              <span>Loading your game history...</span>
            </div>
          )}
          {historyError && (
            <div
              style={{
                color: 'var(--accent)',
                fontWeight: 500,
                margin: '10px auto',
                textAlign: 'center',
                background: 'rgba(255,87,34,0.08)',
                borderRadius: 8,
                maxWidth: 390
              }}
              role="alert"
              aria-live="assertive"
              tabIndex={0}
            >
              {historyError}
            </div>
          )}
        </div>
      )}
      {view === 'game' && (
        <div className="main-container" style={{ position: 'relative' }}>
          {/* Overlay loader for waiting actions */}
          {waiting && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(33,150,243,0.11)',
                display: 'flex',
                zIndex: 18,
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.27em',
                color: 'var(--brand-accent)',
                fontWeight: 700,
                pointerEvents: 'auto'
              }}
              aria-busy="true"
              tabIndex={0}
            >
              <span>Working...</span>
            </div>
          )}
          <div className="central-content">
            <div className="players-row">
              <div
                className={`player-info${currentPlayer === yourSymbol ? ' active' : ''}${waiting ? ' disabled' : ''}`}
                aria-label="You"
                tabIndex={0}
              >
                <span className="player-avatar">{yourSymbol === 'X' ? '❌' : '⭕'}</span>
                <span className="player-name">{username} (You)</span>
                {currentPlayer === yourSymbol && !gameOver &&
                  <span style={{
                    marginLeft: 8,
                    color: 'var(--brand-accent)',
                    fontWeight: 600,
                    fontSize: '0.92em'
                  }}>(Turn)</span>}
              </div>
              <div
                className={`player-info${currentPlayer !== yourSymbol ? ' active' : ''}`}
                aria-label="Opponent"
                tabIndex={0}
              >
                <span className="player-avatar">{yourSymbol === 'X' ? '⭕' : '❌'}</span>
                <span className="player-name">{opponent || "..."}</span>
                {currentPlayer !== yourSymbol && !gameOver &&
                  <span style={{
                    marginLeft: 7,
                    color: 'var(--text-secondary)',
                    fontSize: '0.91em'
                  }}>(Turn)</span>}
              </div>
            </div>
            <GameBoard
              board={board || [[null, null, null], [null, null, null], [null, null, null]]}
              onMove={handleMove}
              disabled={gameOver || currentPlayer !== yourSymbol || waiting}
              currentPlayer={currentPlayer || 'X'}
              yourSymbol={yourSymbol || 'X'}
            />
            {moveError && (
              <div
                style={{
                  color: 'var(--accent)',
                  marginTop: 8,
                  background: 'rgba(255,87,34,0.09)',
                  padding: '5px 17px',
                  borderRadius: 8,
                  fontWeight: 500
                }}
                role="alert"
                aria-live="assertive"
                tabIndex={0}
              >
                {moveError}
              </div>
            )}
            <div className="action-buttons" style={{ opacity: waiting ? 0.68 : 1 }}>
              <button
                className="btn"
                onClick={handleRematch}
                disabled={waiting}
                aria-disabled={waiting}
                style={{ opacity: waiting ? 0.65 : 1 }}
              >
                Reset Board
              </button>
              <button
                className="btn"
                onClick={goToLobby}
                disabled={waiting}
                aria-disabled={waiting}
                style={{ opacity: waiting ? 0.65 : 1 }}
              >
                Lobby
              </button>
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
