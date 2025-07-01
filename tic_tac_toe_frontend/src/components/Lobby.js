import React, { useState } from 'react';
import '../App.css';

// PUBLIC_INTERFACE
function Lobby({ games, joinGame, createGame, username }) {
  /**
   * Displays lobby for creating or joining games.
   * @param {games} Array of available games {id, host, status}
   * @param {joinGame} function to call with game ID
   * @param {createGame} function to create new game
   * @param {username} current user
   */
  const [newGameName, setNewGameName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (newGameName.trim()) {
      createGame(newGameName.trim());
      setNewGameName('');
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div className="game-board" style={{ minWidth: 320, maxWidth: 430 }}>
        <h2 className="brand-accent" style={{ marginBottom: 10 }}>Lobby</h2>
        <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>
          Welcome<span style={{ marginLeft: 6, color: 'var(--primary)' }}> {username}</span>!
        </div>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Game room name"
            value={newGameName}
            onChange={e => setNewGameName(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              fontSize: '0.96rem',
              flex: 1
            }}
          />
          <button className="btn primary" type="submit">New Game</button>
        </form>
        <div style={{ marginBottom: 8, marginTop: 7, color: 'var(--primary)', fontWeight: 600 }}>
          Available Games
        </div>
        <ul className="history-list" style={{ maxHeight: 210, overflowY: 'auto', minHeight: 35 }}>
          {games.length === 0 ?
            <li className="history-item" style={{ color: 'var(--text-secondary)' }}>No games available</li> :
            games.map(g => (
              <li key={g.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <span style={{ color: 'var(--accent)' }}>{g.name}</span> &nbsp;
                  <span style={{ fontSize: '0.95em', color: 'var(--brand-accent)' }}>by {g.host}</span>
                </span>
                <button className="btn" onClick={() => joinGame(g.id)} style={{ padding: '5px 13px', fontSize: '0.97em' }}>Join</button>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
}

export default Lobby;
