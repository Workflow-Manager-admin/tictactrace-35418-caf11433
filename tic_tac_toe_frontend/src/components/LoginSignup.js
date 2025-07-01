import React, { useState } from 'react';
import '../App.css';

// PUBLIC_INTERFACE
function LoginSignup({ onLogin }) {
  /**
   * Renders a login/signup view for optional user authentication.
   * Calls onLogin(username) on successful login/signup.
   */
  const [username, setUsername] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username required');
      return;
    }
    setError('');
    onLogin(username.trim());
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="game-board" style={{ minWidth: 310, maxWidth: 390 }}>
        <h2 className="brand-accent" style={{ marginBottom: 14 }}>
          {isSignup ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Enter username"
            aria-label="Username"
            value={username}
            autoFocus
            onChange={e => setUsername(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              fontSize: '1.07rem',
              outline: 'none'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') e.target.blur();
            }}
          />
          {error && <div role="alert" aria-live="assertive" tabIndex={0} style={{ color: 'var(--accent)', fontSize: '0.97em' }}>{error}</div>}
          <button className="btn primary" type="submit" style={{ width: '100%' }}>
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div style={{
          marginTop: 13,
          color: 'var(--text-secondary)',
          fontSize: '0.94em',
          textAlign: 'center'
        }}>
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsSignup(false)} className="btn" style={{ fontSize: '0.95em', padding: '4px 11px' }}>
                Login
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button onClick={() => setIsSignup(true)} className="btn" style={{ fontSize: '0.95em', padding: '4px 11px' }}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
