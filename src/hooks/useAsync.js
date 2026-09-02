import { useReducer, useRef, useCallback, useEffect } from 'react';

import { ErrorCode } from '../api/errors';

/**
 * Single source of async-state semantics for every fetch site.
 *
 * Manages an AbortController per run and a mounted guard so results that arrive
 * after unmount (or after a superseding run) are ignored — no setState on an
 * unmounted component (closes analysis P5). Aborts never surface as user errors.
 *
 * @returns {{status:'idle'|'loading'|'success'|'error', data:*, error:*, run:Function, retry:Function, reset:Function}}
 */

const initialState = { status: 'idle', data: null, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { status: 'loading', data: state.data, error: null };
    case 'success':
      return { status: 'success', data: action.data, error: null };
    case 'error':
      return { status: 'error', data: null, error: action.error };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

export default function useAsync() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mountedRef = useRef(true);
  const controllerRef = useRef(null);
  const lastFetcherRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const run = useCallback(async (fetcher) => {
    lastFetcherRef.current = fetcher;

    // Supersede any in-flight request.
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    dispatch({ type: 'loading' });

    let result;
    try {
      result = await fetcher(controller.signal);
    } catch (error) {
      if (!mountedRef.current || controller.signal.aborted) return;
      dispatch({ type: 'error', error });
      return;
    }

    if (!mountedRef.current || controller.signal.aborted) return;

    if (result && result.ok) {
      dispatch({ type: 'success', data: result.data });
    } else if (result && result.error && result.error.code === ErrorCode.ABORTED) {
      // Expected on unmount / superseding run — ignore silently.
    } else {
      dispatch({ type: 'error', error: result ? result.error : undefined });
    }
  }, []);

  const retry = useCallback(() => {
    if (lastFetcherRef.current) run(lastFetcherRef.current);
  }, [run]);

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { status: state.status, data: state.data, error: state.error, run, retry, reset };
}
