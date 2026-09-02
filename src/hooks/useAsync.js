import { useReducer, useRef, useCallback, useEffect } from 'react';

import { asyncReducer, initialAsyncState, resultToAction } from '../state/asyncMachine';

/**
 * Single source of async-state semantics for every fetch site.
 *
 * Manages an AbortController per run and a mounted guard so results that arrive
 * after unmount (or after a superseding run) are ignored — no setState on an
 * unmounted component (closes analysis P5). Aborts never surface as user errors.
 *
 * The status transitions themselves live in ../state/asyncMachine so the class
 * `App` container reuses the exact same state machine instead of duplicating it.
 *
 * @returns {{status:'idle'|'loading'|'success'|'error', data:*, error:*, run:Function, retry:Function, reset:Function}}
 */
export default function useAsync() {
  const [state, dispatch] = useReducer(asyncReducer, initialAsyncState);
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

    // resultToAction turns a stray ABORTED result into a reset→idle rather than
    // leaving the reducer stuck on 'loading' with no consumer-visible recovery.
    dispatch(resultToAction(result));
  }, []);

  const retry = useCallback(() => {
    if (lastFetcherRef.current) run(lastFetcherRef.current);
  }, [run]);

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { status: state.status, data: state.data, error: state.error, run, retry, reset };
}
