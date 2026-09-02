import { AsyncStatus } from '../constants/asyncStatus';
import { ErrorCode } from '../api/errors';

/**
 * The async state machine, extracted so it is defined exactly once and shared
 * by every consumer. The `useAsync` hook and the class-based `App` container
 * both drive their state through this reducer + `resultToAction`, instead of
 * each hand-rolling the "loading → success/error, ignore ABORTED" transitions.
 */

export const initialAsyncState = { status: AsyncStatus.IDLE, data: null, error: null };

export function asyncReducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { status: AsyncStatus.LOADING, data: state.data, error: null };
    case 'success':
      return { status: AsyncStatus.SUCCESS, data: action.data, error: null };
    case 'error':
      return { status: AsyncStatus.ERROR, data: null, error: action.error };
    case 'reset':
      return initialAsyncState;
    default:
      return state;
  }
}

/**
 * Map a settled `Result` to the next reducer action.
 *
 * An ABORTED result is terminal-but-silent: it resolves back to `idle` rather
 * than surfacing a user-facing error OR leaving the machine stuck on `loading`
 * forever (a state Chart/CountryPicker/Cards give no recovery path out of).
 */
export function resultToAction(result) {
  if (result && result.ok) {
    return { type: 'success', data: result.data };
  }
  if (result && result.error && result.error.code === ErrorCode.ABORTED) {
    return { type: 'reset' };
  }
  return { type: 'error', error: result ? result.error : undefined };
}
