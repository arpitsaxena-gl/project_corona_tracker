// Tests for the useAsync state machine — Redmine #16.
// The repo pins @testing-library/react@9 (no renderHook), so the hook is driven
// through a tiny harness component. Covers the idle→loading→success/error
// transitions, the silent-ignore of ABORTED results, and retry/reset (P5).
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import useAsync from './useAsync';
import { ok, fail, AppError, ErrorCode } from '../api/errors';

function Harness({ fetcher }) {
  const { status, data, error, run, retry, reset } = useAsync();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="data">{data == null ? '' : JSON.stringify(data)}</span>
      <span data-testid="error">{error ? error.message : ''}</span>
      <button type="button" onClick={() => run(fetcher)}>
        run
      </button>
      <button type="button" onClick={retry}>
        retry
      </button>
      <button type="button" onClick={reset}>
        reset
      </button>
    </div>
  );
}

const status = (utils) => utils.getByTestId('status').textContent;

describe('useAsync', () => {
  it('starts in the idle state', () => {
    const utils = render(<Harness fetcher={jest.fn()} />);
    expect(status(utils)).toBe('idle');
  });

  it('resolves an ok() Result to the success state and exposes the data', async () => {
    const fetcher = jest.fn().mockResolvedValue(ok({ n: 1 }));
    const utils = render(<Harness fetcher={fetcher} />);
    await act(async () => {
      fireEvent.click(utils.getByText('run'));
    });
    expect(status(utils)).toBe('success');
    expect(utils.getByTestId('data').textContent).toBe(JSON.stringify({ n: 1 }));
    expect(fetcher).toHaveBeenCalledTimes(1);
    // fetcher is invoked with the run's AbortSignal.
    expect(fetcher.mock.calls[0][0]).toBeDefined();
  });

  it('resolves a fail() Result to the error state and surfaces the error', async () => {
    const fetcher = jest.fn().mockResolvedValue(fail(new AppError(ErrorCode.NETWORK, 'down')));
    const utils = render(<Harness fetcher={fetcher} />);
    await act(async () => {
      fireEvent.click(utils.getByText('run'));
    });
    expect(status(utils)).toBe('error');
    expect(utils.getByTestId('error').textContent).toBe('down');
  });

  it('silently ignores an ABORTED Result — it must not surface as a user error (P5)', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValue(fail(new AppError(ErrorCode.ABORTED, 'Request aborted')));
    const utils = render(<Harness fetcher={fetcher} />);
    await act(async () => {
      fireEvent.click(utils.getByText('run'));
    });
    // Stays on the prior (loading) state; never flips to error.
    expect(status(utils)).toBe('loading');
    expect(utils.getByTestId('error').textContent).toBe('');
  });

  it('retry() re-invokes the last fetcher', async () => {
    const fetcher = jest.fn().mockResolvedValue(ok(1));
    const utils = render(<Harness fetcher={fetcher} />);
    await act(async () => {
      fireEvent.click(utils.getByText('run'));
    });
    await act(async () => {
      fireEvent.click(utils.getByText('retry'));
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('reset() returns the hook to idle', async () => {
    const fetcher = jest.fn().mockResolvedValue(ok(1));
    const utils = render(<Harness fetcher={fetcher} />);
    await act(async () => {
      fireEvent.click(utils.getByText('run'));
    });
    expect(status(utils)).toBe('success');
    act(() => {
      fireEvent.click(utils.getByText('reset'));
    });
    expect(status(utils)).toBe('idle');
  });
});
