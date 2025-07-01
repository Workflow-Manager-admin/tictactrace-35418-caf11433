//
// PUBLIC_INTERFACE
/**
 * Network helpers to talk to the backend API and manage WebSocket updates.
 * - Handles login/signup, create/join game, submit move, poll game state/history.
 * - Establishes and manages WebSocket connection for live game updates.
 * All base URLs assume proxy/dev setup. Adjust as needed.
 */

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";
const WS_BASE = process.env.REACT_APP_WS_BASE || API_BASE.replace(/^http/, "ws");

let ws = null;

/**
 * Returns the backend API base URL.
 */
export function getApiBase() {
  return API_BASE;
}

/**
 * Log in or sign up with a username.
 * On success, returns user object or token (if backend uses tokens).
 */
export async function loginOrSignup(username, signup = false) {
  const route = signup ? "/user/signup" : "/user/login";
  const resp = await fetch(API_BASE + route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

/**
 * Fetches available game lobbies.
 */
export async function fetchAvailableGames() {
  const resp = await fetch(`${API_BASE}/game/lobby`);
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

/**
 * Create a new game room.
 */
export async function createGame(username, roomName) {
  const resp = await fetch(`${API_BASE}/game/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host: username, name: roomName }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json(); // { game_id, ... }
}

/**
 * Join an existing game.
 */
export async function joinGame(username, gameId) {
  const resp = await fetch(`${API_BASE}/game/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, game_id: gameId }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

/**
 * Fetch current board state for a game.
 */
export async function fetchGame(gameId) {
  const resp = await fetch(`${API_BASE}/game/${gameId}/state`);
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

/**
 * Submit a move for a game.
 */
export async function submitMove(gameId, username, row, col) {
  const resp = await fetch(`${API_BASE}/game/${gameId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, row, col }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

/**
 * Fetch game history for a user.
 */
export async function fetchGameHistory(username) {
  const resp = await fetch(`${API_BASE}/user/history?username=${encodeURIComponent(username)}`);
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

/**
 * Opens a WebSocket to receive board/game updates.
 * @param {string} gameId - The game ID to subscribe to
 * @param {function} onUpdate - Handler for board/game update messages 
 * @param {function} onError - Handler for socket errors
 * @return {function} close - Call to close the socket
 */
export function subscribeToGame(gameId, onUpdate, onError) {
  if (ws) ws.close();
  ws = new window.WebSocket(`${WS_BASE}/ws/game/${gameId}`);
  ws.onmessage = (event) => {
    try {
      onUpdate(JSON.parse(event.data));
    } catch (err) {
      if (onError) onError(err);
    }
  };
  ws.onerror = (err) => {
    if (onError) onError(err);
  };
  ws.onclose = () => {};
  return () => { if (ws) ws.close(); ws = null; };
}
