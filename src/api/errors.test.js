// Unit tests for the Result/error contract — Redmine #16.
// Verifies analysis P1/S3: the API boundary never returns a raw Error as data;
// every failure is a normalized AppError with a stable, classified code.
import { ErrorCode, AppError, ok, fail, toAppError } from './errors';

describe('errors — ok() / fail() Result wrappers', () => {
  it('ok() wraps a payload as a success Result', () => {
    expect(ok({ a: 1 })).toEqual({ ok: true, data: { a: 1 } });
  });

  it('fail() passes an existing AppError through untouched', () => {
    const e = new AppError(ErrorCode.HTTP, 'boom');
    const res = fail(e);
    expect(res.ok).toBe(false);
    expect(res.error).toBe(e);
  });

  it('fail() coerces a plain Error into an AppError (UNKNOWN, message preserved)', () => {
    const res = fail(new Error('plain failure'));
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(AppError);
    expect(res.error.code).toBe(ErrorCode.UNKNOWN);
    expect(res.error.message).toBe('plain failure');
  });
});

describe('errors — toAppError() transport classification', () => {
  it('classifies aborts/cancellations as ABORTED (so they can be ignored, not shown)', () => {
    expect(toAppError({ name: 'CanceledError' }).code).toBe(ErrorCode.ABORTED);
    expect(toAppError({ name: 'AbortError' }).code).toBe(ErrorCode.ABORTED);
    expect(toAppError({ code: 'ERR_CANCELED' }).code).toBe(ErrorCode.ABORTED);
    expect(toAppError({ message: 'canceled' }).code).toBe(ErrorCode.ABORTED);
  });

  it('classifies an HTTP response error as HTTP and keeps the status in the message', () => {
    const err = toAppError({ response: { status: 503 } });
    expect(err.code).toBe(ErrorCode.HTTP);
    expect(err.message).toMatch(/503/);
  });

  it('classifies a request-without-response as a NETWORK error', () => {
    expect(toAppError({ request: {} }).code).toBe(ErrorCode.NETWORK);
  });

  it('falls back to UNKNOWN for anything unrecognized (including null)', () => {
    expect(toAppError({ message: 'weird' }).code).toBe(ErrorCode.UNKNOWN);
    expect(toAppError(null).code).toBe(ErrorCode.UNKNOWN);
  });
});
