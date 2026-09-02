// End-to-end container test for App — Redmine #16.
// The service, chart, and count-up libs are mocked so the flow is deterministic
// and offline. Verifies the headline P1 fix: a totals failure surfaces a distinct
// error state with a working Retry (never a permanent "Loading…"), and retry
// recovers to the ready state.
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import App from './App';
import { getTotals, getCountries, getDailyData } from './services/covidService';
import { ok, fail, AppError, ErrorCode } from './api/errors';

jest.mock('./services/covidService');
jest.mock('react-countup', () => ({ __esModule: true, default: ({ end }) => end }));
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Line: () => <div data-testid="line-chart" />,
}));

afterEach(() => jest.resetAllMocks());

describe('App container (P1 end-to-end)', () => {
  it('shows a distinct error + Retry when totals fail, then recovers on retry', async () => {
    getCountries.mockResolvedValue(ok([]));
    getDailyData.mockResolvedValue(ok([]));
    getTotals
      .mockResolvedValueOnce(fail(new AppError(ErrorCode.NETWORK, 'Network error')))
      .mockResolvedValueOnce(ok({ confirmed: 100, recovered: 60, deaths: 5, lastUpdate: null }));

    let utils;
    await act(async () => {
      utils = render(<App />);
    });
    const { getByText, queryByText } = utils;

    // First load failed → distinct error state, not a permanent "Loading…".
    expect(getByText('Network error')).toBeInTheDocument();
    expect(queryByText('Loading…')).toBeNull();

    // Retry re-fetches; the second call succeeds → ready state.
    await act(async () => {
      fireEvent.click(getByText('Retry'));
    });
    expect(getByText('Global')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();
    expect(queryByText('Network error')).toBeNull();
    expect(getTotals).toHaveBeenCalledTimes(2);
  });
});
