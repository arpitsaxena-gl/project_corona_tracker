// Tests for the shared async state machine — Redmine #16.
// Verifies the reducer transitions and, in particular, that a stray ABORTED
// Result maps to a reset (→ idle) instead of leaving the machine on 'loading'
// with no recovery path (the latent trap flagged in review).
import { AsyncStatus } from '../constants/asyncStatus';
import { initialAsyncState, asyncReducer, resultToAction } from './asyncMachine';
import { ok, fail, AppError, ErrorCode } from '../api/errors';

describe('asyncReducer', () => {
  it('loading keeps prior data and clears the error', () => {
    const prev = { status: AsyncStatus.SUCCESS, data: { n: 1 }, error: null };
    expect(asyncReducer(prev, { type: 'loading' })).toEqual({
      status: AsyncStatus.LOADING,
      data: { n: 1 },
      error: null,
    });
  });

  it('success stores data and clears the error', () => {
    expect(asyncReducer(initialAsyncState, { type: 'success', data: 42 })).toEqual({
      status: AsyncStatus.SUCCESS,
      data: 42,
      error: null,
    });
  });

  it('error stores the error and drops stale data', () => {
    const err = new AppError(ErrorCode.NETWORK, 'down');
    expect(asyncReducer({ status: 'success', data: 1, error: null }, { type: 'error', error: err })).toEqual({
      status: AsyncStatus.ERROR,
      data: null,
      error: err,
    });
  });

  it('reset returns the initial idle state', () => {
    expect(asyncReducer({ status: 'error', data: null, error: {} }, { type: 'reset' })).toEqual(
      initialAsyncState,
    );
  });
});

describe('resultToAction', () => {
  it('maps ok() to a success action', () => {
    expect(resultToAction(ok({ n: 1 }))).toEqual({ type: 'success', data: { n: 1 } });
  });

  it('maps an ABORTED failure to reset (idle) — never a stuck loading or a user error', () => {
    expect(resultToAction(fail(new AppError(ErrorCode.ABORTED, 'Request aborted')))).toEqual({
      type: 'reset',
    });
  });

  it('maps a non-abort failure to an error action', () => {
    const err = new AppError(ErrorCode.HTTP, '500');
    expect(resultToAction(fail(err))).toEqual({ type: 'error', error: err });
  });
});
