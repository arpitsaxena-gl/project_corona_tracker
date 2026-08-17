import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Chart from './Chart';

jest.mock('../../api', () => ({
  fetchDailyData: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
}));

import { fetchDailyData } from '../../api';

const sampleRecords = [
  { date: '1/22/20', confirmed: 555, deaths: 17, recovered: 28 },
  { date: '1/23/20', confirmed: 654, deaths: 18, recovered: 30 },
];

afterEach(() => {
  jest.clearAllMocks();
});

describe('Chart', () => {
  it('renders a loading indicator while fetching daily data', async () => {
    fetchDailyData.mockReturnValue(new Promise(() => {}));

    await act(async () => {
      render(<Chart country="" />);
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error message when fetchDailyData rejects', async () => {
    fetchDailyData.mockRejectedValue(new Error('Failed to fetch daily data: timeout'));

    await act(async () => {
      render(<Chart country="" />);
    });

    expect(await screen.findByText(/Failed to fetch daily data/i)).toBeInTheDocument();
  });

  it('renders the Line chart when daily data resolves successfully', async () => {
    fetchDailyData.mockResolvedValue(sampleRecords);

    await act(async () => {
      render(<Chart country="" />);
    });

    expect(await screen.findByTestId('line-chart')).toBeInTheDocument();
  });

  it('calls fetchDailyData with the country prop when country changes', async () => {
    fetchDailyData.mockResolvedValue(sampleRecords);

    const { rerender } = render(<Chart country="" />);
    await screen.findByTestId('line-chart');

    fetchDailyData.mockClear();
    fetchDailyData.mockResolvedValue(sampleRecords);

    await act(async () => {
      rerender(<Chart country="Brazil" />);
    });

    expect(fetchDailyData).toHaveBeenCalledWith('Brazil', expect.any(AbortSignal));
  });
});
