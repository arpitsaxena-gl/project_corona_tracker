
// App.test.jsx
// Ticket: Redmine #8 — COVID Tracker Enhancement
// Verifies: AC-01 (global stats on initial load), AC-03 (no TypeError on failure),
//            AC-04 (ErrorBoundary integration), AC-05 (functional component works)

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './App';

// Mock all child components so we can test App's orchestration in isolation
jest.mock('./components', () => ({
  Cards: ({ loading, error, data }) => (
    <div>
      {loading && <span>cards-loading</span>}
      {error && <span>cards-error: {error}</span>}
      {data && <span>cards-data</span>}
    </div>
  ),
  CountryPicker: ({ handleCountryChange }) => (
    <select data-testid="country-select" onChange={handleCountryChange}>
      <option value="">Global</option>
      <option value="Brazil">Brazil</option>
    </select>
  ),
  Chart: ({ country }) => <div>chart-{country || 'global'}</div>,
}));

jest.mock('./api', () => ({
  fetchData: jest.fn(),
}));

// Mock axios for isCancel check
jest.mock('axios', () => ({
  isCancel: jest.fn().mockReturnValue(false),
}));

import { fetchData } from './api';

const mockStats = {
  confirmed: { value: 100000 },
  recovered: { value: 80000 },
  deaths: { value: 5000 },
  lastUpdate: '2021-01-01T00:00:00.000Z',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('App (functional component)', () => {
  // AC-01 / design: App renders global stats on mount (country defaults to "")
  it('calls fetchData with empty country string on initial mount', async () => {
    fetchData.mockResolvedValue(mockStats);

    await act(async () => {
      render(<App />);
    });

    expect(fetchData).toHaveBeenCalledWith('', expect.any(AbortSignal));
  });

  // AC-01 / design: loading state shown while fetchData is pending
  it('renders loading state while fetchData is pending', async () => {
    fetchData.mockReturnValue(new Promise(() => {})); // never resolves

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('cards-loading')).toBeInTheDocument();
  });

  // AC-01 / design: data rendered after fetchData resolves
  it('renders data state after fetchData resolves', async () => {
    fetchData.mockResolvedValue(mockStats);

    await act(async () => {
      render(<App />);
    });

    expect(await screen.findByText('cards-data')).toBeInTheDocument();
  });

  // AC-03 / analysis: API failure sets error state, does not throw TypeError
  it('renders error state when fetchData rejects (no TypeError thrown)', async () => {
    fetchData.mockRejectedValue(new Error('Failed to fetch COVID stats: timeout'));

    await act(async () => {
      render(<App />);
    });

    expect(await screen.findByText(/cards-error/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch COVID stats/i)).toBeInTheDocument();
  });

  // AC-02 / design: country selection triggers re-fetch with selected country
  it('re-fetches data with selected country when CountryPicker changes', async () => {
    fetchData.mockResolvedValue(mockStats);

    const { getByTestId } = await act(async () => render(<App />));

    await screen.findByText('cards-data');
    fetchData.mockClear();
    fetchData.mockResolvedValue(mockStats);

    const select = getByTestId('country-select');
    await act(async () => {
      select.value = 'Brazil';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(fetchData).toHaveBeenCalledWith('Brazil', expect.any(AbortSignal));
  });

  // AC-03 / design: AbortController cancel is not treated as error
  it('does not set error state when fetchData is cancelled (isCancel returns true)', async () => {
    const axios = require('axios');
    axios.isCancel.mockReturnValue(true);

    const cancelError = new Error('Request cancelled');
    fetchData.mockRejectedValue(cancelError);

    await act(async () => {
      render(<App />);
    });

    // Cancelled request: error state should NOT be set
    expect(screen.queryByText(/cards-error/i)).not.toBeInTheDocument();
  });

  // AC-04 / design: App renders inside ErrorBoundary (integration verified at index.js level)
  // This test confirms App itself does not throw during a successful render cycle
  it('renders without throwing when data is available', async () => {
    fetchData.mockResolvedValue(mockStats);

    let threwError = false;
    try {
      await act(async () => {
        render(<App />);
      });
    } catch {
      threwError = true;
    }

    expect(threwError).toBe(false);
    expect(await screen.findByText('cards-data')).toBeInTheDocument();
  });
});
