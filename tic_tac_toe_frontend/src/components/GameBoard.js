import React from 'react';
import '../App.css';

// PUBLIC_INTERFACE
function GameBoard({
  board,
  onMove,
  disabled,
  currentPlayer,
  yourSymbol
}) {
  /**
   * Interactive Tic Tac Toe 3x3 board UI.
   * @param {board} 2D array
   * @param {onMove} function(row, col) for move input
   * @param {disabled} disables board if game is over or not your turn
   * @param {currentPlayer} whose turn ('X', 'O')
   * @param {yourSymbol} your symbol ('X' or 'O')
   */
  function handleClick(i, j) {
    if (!disabled && !board[i][j]) {
      onMove(i, j);
    }
  }

  return (
    <div>
      <div style={{
        marginBottom: 14,
        fontWeight: 600,
        color: 'var(--brand-accent)',
        letterSpacing: 0.7
      }}>
        {currentPlayer === yourSymbol
          ? "Your turn!" 
          : `Opponent's turn (${currentPlayer})`}
      </div>
      <div className="game-board">
        {board.map((row, i) => (
          <div key={i} className="board-row">
            {row.map((cell, j) => (
              <div
                key={j}
                className="board-cell"
                style={{
                  cursor: !cell && !disabled ? 'pointer' : 'default',
                  background: cell ? undefined : undefined,
                  outline: !cell && !disabled ? '2px solid var(--primary)' : 'none'
                }}
                tabIndex={(!cell && !disabled) ? 0 : -1}
                aria-label={`Cell ${i + 1},${j + 1}${cell ? `: ${cell}` : ''}`}
                onClick={() => handleClick(i, j)}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ' ') && !cell && !disabled) handleClick(i, j);
                }}
              >
                {cell === "X" ? "❌" : cell === "O" ? "⭕" : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameBoard;
