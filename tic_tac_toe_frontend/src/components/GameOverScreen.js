import React from 'react';
import '../App.css';

// PUBLIC_INTERFACE
function GameOverScreen({ winner, isDraw, yourSymbol, onNewGame, onLobby }) {
  /**
   * Displays a modal/screen for game results (win/loss/draw) and actions.
   * @param {winner} "X", "O", or null; winning symbol if any
   * @param {isDraw} true if draw
   * @param {yourSymbol} user's symbol
   * @param {onNewGame} callback for rematch
   * @param {onLobby} callback to return to lobby
   */
  let message;
  if (winner) {
    message = (yourSymbol === winner)
      ? <>🎉 <span style={{ color: 'var(--brand-accent)' }}>You win!</span></>
      : <>😢 You lost. <span style={{ color: 'var(--accent)' }}>Opponent wins.</span></>;
  } else if (isDraw) {
    message = <>🤝 <span style={{ color: 'var(--primary)' }}>It's a Draw!</span></>;
  } else {
    message = null;
  }

  return (
    <div style={{
      position: 'fixed',
      left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(20,25,40,0.27)',
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div
        className="game-board"
        style={{
          minWidth: 250,
          paddingTop: 35,
          paddingBottom: 35,
          textAlign: 'center',
          borderColor: 'var(--brand-accent)',
          boxShadow: '0 2px 16px rgba(33,150,243,.18)',
        }}>
        <div style={{
          fontSize: '2.0em',
          marginBottom: 10,
          fontWeight: 700
        }}>
          {message}
        </div>
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 17 }}>
          <button className="btn primary" onClick={onNewGame}>New Game</button>
          <button className="btn" onClick={onLobby}>Back to Lobby</button>
        </div>
      </div>
    </div>
  );
}

export default GameOverScreen;
