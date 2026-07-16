import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Chart from './Chart';
import { fetchTimeline } from '../../api';

jest.mock('../../api', () => ({
  fetchTimeline: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Bar: () => <div data-testid="bar-chart" />,
}));

describe('Chart', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('does not fetch timeline when a country is selected', async () => {
    const data = {
      confirmed: { value: 1 },
      recovered: { value: 0 },
      deaths: { value: 0 },
    };
    render(<Chart data={data} country="India" />);
    await waitFor(() => {
      expect(fetchTimeline).not.toHaveBeenCalled();
    });
  });

  test('shows No timeline data when global timeline is empty', async () => {
    fetchTimeline.mockResolvedValue([]);
    const { findByText } = render(
      <Chart data={{}} country="" />,
    );
    expect(await findByText('No timeline data')).toBeTruthy();
    expect(fetchTimeline).toHaveBeenCalled();
  });
});
