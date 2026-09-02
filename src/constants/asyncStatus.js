/**
 * The single source of truth for async status values.
 *
 * Every component and hook that renders or compares async state imports these
 * instead of re-typing the `'idle' | 'loading' | 'success' | 'error'` string
 * literals (and the matching `PropTypes.oneOf([...])` array). Frozen so the set
 * cannot drift — the same pattern this codebase already uses for `ErrorCode`.
 */
export const AsyncStatus = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
});

/** The status values as an array — for `PropTypes.oneOf(ASYNC_STATUS_VALUES)`. */
export const ASYNC_STATUS_VALUES = Object.freeze(Object.values(AsyncStatus));
