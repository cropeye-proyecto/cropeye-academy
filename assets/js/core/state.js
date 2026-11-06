/**
 * Progress state: the single source of truth for completed lessons.
 *
 * Persisted in localStorage under "cropeye.progress" with this shape:
 *   { "version": 1, "completed": ["p1-m1-s1-l1", ...] }
 *
 * Every mutation emits both a local subscriber notification and a custom DOM
 * event, so the dashboard, the sidebar and the lesson footer stay in sync
 * without knowing about each other.
 */

export const STORAGE_KEY = 'cropeye.progress';
export const CHANGE_EVENT = 'cropeye:progress-change';
const STATE_VERSION = 1;

const listeners = new Set();
let state = emptyState();
let completedSet = new Set();

function emptyState() {
  return { version: STATE_VERSION, completed: [] };
}

/** Persist a fresh empty payload; used when storage is missing or corrupted. */
function resetStorage() {
  const fresh = emptyState();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch (_error) {
    // localStorage can be blocked (private mode, disabled storage). Ignore.
  }
  return fresh;
}

function readState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STATE_VERSION || !Array.isArray(parsed.completed)) {
      return resetStorage();
    }

    const unique = [];
    for (const id of parsed.completed) {
      if (typeof id === 'string' && id && !unique.includes(id)) unique.push(id);
    }
    return { version: STATE_VERSION, completed: unique };
  } catch (_error) {
    // Unreadable JSON, quota errors or a blocked Storage object.
    return resetStorage();
  }
}

function commit(next) {
  state = next;
  completedSet = new Set(state.completed);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // Keep the in-memory state even if persistence fails.
  }

  emit();
}

function emit() {
  const snapshot = { version: state.version, completed: [...state.completed] };

  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch (error) {
      // A broken listener must never break the rest of the app.
      console.error('[progress] listener failed', error);
    }
  }

  document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: snapshot }));
}

/** Load the current state from storage into memory. Returns a snapshot. */
export function load() {
  state = readState();
  completedSet = new Set(state.completed);
  return { version: state.version, completed: [...state.completed] };
}

/** @param {string} lessonId */
export function isCompleted(lessonId) {
  return completedSet.has(lessonId);
}

/**
 * Toggle a lesson. Returns the new completed flag.
 * @param {string} lessonId
 * @returns {boolean}
 */
export function toggle(lessonId) {
  if (!lessonId) return false;

  const next = isCompleted(lessonId)
    ? state.completed.filter((id) => id !== lessonId)
    : [...state.completed, lessonId];

  commit({ version: STATE_VERSION, completed: next });
  return isCompleted(lessonId);
}

/** Total number of completed lessons. */
export function countCompleted() {
  return state.completed.length;
}

/** Immutable snapshot, useful for rendering and debugging. */
export function getState() {
  return { version: state.version, completed: [...state.completed] };
}

/**
 * Subscribe to progress changes.
 * @param {(snapshot: {version: number, completed: string[]}) => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribe(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Re-sync when another tab changes the same key.
try {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = readState();
    completedSet = new Set(state.completed);
    emit();
  });
} catch (_error) {
  // No window object (or blocked event listeners): nothing to sync.
}

// Initialise on import so consumers can render immediately.
load();
