/**
 * Normalized error/result contract for the API boundary.
 *
 * This is the primitive that eliminates the "return the caught error as data"
 * defect (analysis P1/S3): every fetch returns a `Result` — `ok(data)` on
 * success or `fail(AppError)` on failure — so a network failure can never be
 * mistaken for slow-loading data.
 */

export const ErrorCode = Object.freeze({
  NETWORK: 'NETWORK',
  HTTP: 'HTTP',
  MALFORMED: 'MALFORMED',
  ABORTED: 'ABORTED',
  UNKNOWN: 'UNKNOWN',
});

export class AppError extends Error {
  constructor(code, message, cause) {
    super(message || code || 'Unknown error');
    this.name = 'AppError';
    this.code = code || ErrorCode.UNKNOWN;
    this.cause = cause;
  }
}

/** Wrap a successful payload. */
export const ok = (data) => ({ ok: true, data });

/** Wrap a failure, coercing anything that is not already an AppError. */
export const fail = (error) => ({
  ok: false,
  error:
    error instanceof AppError
      ? error
      : new AppError(ErrorCode.UNKNOWN, (error && error.message) || String(error), error),
});

/**
 * Map a thrown transport error (axios / fetch / AbortController) to an AppError
 * with a stable code. Aborts are distinguished so consumers can silently ignore
 * them instead of surfacing a user-facing error.
 */
export function toAppError(error) {
  if (
    error &&
    (error.name === 'CanceledError' ||
      error.name === 'AbortError' ||
      error.code === 'ERR_CANCELED' ||
      error.message === 'canceled')
  ) {
    return new AppError(ErrorCode.ABORTED, 'Request aborted', error);
  }
  if (error && error.response) {
    const status = error.response.status;
    return new AppError(ErrorCode.HTTP, `Request failed with status ${status}`, error);
  }
  if (error && error.request) {
    return new AppError(ErrorCode.NETWORK, 'Network error — please check your connection', error);
  }
  return new AppError(ErrorCode.UNKNOWN, (error && error.message) || 'Unknown error', error);
}
