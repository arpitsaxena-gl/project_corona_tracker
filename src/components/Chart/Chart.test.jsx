// Component tests for Chart — Redmine #16.
// Chart.js needs a real canvas, so react-chartjs-2 is stubbed; the daily service
// is mocked for a deterministic, offline fetch. Verifies bar-vs-line routing and
// the explicit daily loading / ready / empty / error states (closes P3, P5).
import React from 'react';
import { render, act } from '@testing-library/react';

import Chart from './Chart';
import { getDailyData } from '../../services/covidService';
import { ok, fail, AppError, ErrorCode } from '../../api/errors';

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Line: () => <div data-testid="line-chart" />,
}));
jest.mock('../../services/covidService');

afterEach(() => jest.resetAllMocks());

async function renderChart(props) {
  let utils;
  await act(async () => {
    utils = render(<Chart {...props} />);
  });
  return utils;
}

describe('Chart', () => {
  it('renders the per-country bar chart when a country and totals are provided', async () => {
    getDailyData.mockResolvedValue(ok([]));
    const { getByTestId, queryByTestId } = await renderChart({
      country: 'India',
      status: 'success',
      data: { confirmed: 100, recovered: 60, deaths: 5 },
    });
    expect(getByTestId('bar-chart')).toBeInTheDocument();
    expect(queryByTestId('line-chart')).toBeNull();
  });

  it('renders the daily line chart when rows exist and no country is selected', async () => {
    getDailyData.mockResolvedValue(ok([{ date: '2026-08-01', confirmed: 3, deaths: 1 }]));
    const { getByTestId } = await renderChart({ country: '', status: 'idle' });
    expect(getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows a graceful empty state when the daily source returns no rows (P3)', async () => {
    getDailyData.mockResolvedValue(ok([]));
    const { getByText, queryByTestId } = await renderChart({ country: '' });
    expect(getByText('No daily data available.')).toBeInTheDocument();
    expect(queryByTestId('line-chart')).toBeNull();
  });

  it('shows an unavailable message when the daily fetch fails', async () => {
    getDailyData.mockResolvedValue(fail(new AppError(ErrorCode.NETWORK, 'down')));
    const { getByText } = await renderChart({ country: '' });
    expect(getByText('Daily data is currently unavailable.')).toBeInTheDocument();
  });

  it('shows a loading state while the daily fetch is in flight', () => {
    getDailyData.mockReturnValue(new Promise(() => {})); // never resolves
    let utils;
    act(() => {
      utils = render(<Chart country="" />);
    });
    expect(utils.getByText('Loading daily data…')).toBeInTheDocument();
  });
});
