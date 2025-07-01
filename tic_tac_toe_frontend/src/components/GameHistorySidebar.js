import React from 'react';
import '../App.css';

// PUBLIC_INTERFACE
function GameHistorySidebar({ history, onSelectGame }) {
  /**
   * Sidebar or popup listing past games (history).
   * @param {history} Array of {opponent, result, date}
   * @param {onSelectGame} function to load selected game details
   */
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Game History</div>
      <ul className="history-list">
        {history.length === 0 ? (
          <li className="history-item" style={{ color: 'var(--text-secondary)' }}>No game history yet.</li>
        ) : (
          history.map((game, idx) => (
            <li
              key={idx}
              className="history-item"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectGame(game)}
              tabIndex={0}
              aria-label={`Game vs ${game.opponent}, ${game.result}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelectGame(game); }}
            >
              <b style={{ color: game.result === 'Win' ? 'var(--brand-accent)' : (game.result === 'Loss' ? 'var(--accent)' : 'var(--primary)') }}>
                {game.result}
              </b>{' '}
              vs {game.opponent}
              <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.92em', marginTop: 2 }}>
                {game.date}
              </span>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

export default GameHistorySidebar;
