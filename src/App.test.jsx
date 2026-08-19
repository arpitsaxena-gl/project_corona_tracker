// COVID-19 Tracker — App integration tests | Ticket: COVID-19
// Verifies: AC-P1 (content renders from hooks), AC-P2 (loading spinner, error banner)
// Hooks are mocked so this test is isolated from API + network
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

jest.mock('./hooks/useCovid19Stats');
jest.mock('./hooks/useCountries');
jest.mock('./hooks/useDailyData');
jest.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Bar:  () => <canvas data-testid="bar-chart" />,
}));

import App from './App';
import useCovid19Stats from './hooks/useCovid19Stats';
import useCountries from './hooks/useCountries';
import useDailyData from './hooks/useDailyData';

const MOCK_STATS = {
  confirmed: { value: 1000 },
  recovered: { value: 800 },
  deaths:    { value: 50 },
  lastUpdate: '2021-01-01T00:00:00.000Z',
};

const MOCK_DAILY = [
  { confirmed: 100, recovered: 80, deaths: 5, date: '1/1/21' },
];

const MOCK_COUNTRIES = ['Germany', 'France'];

// Helper: set all three hooks to succeeded state
function mockAllLoaded() {
  useCovid19Stats.mockReturnValue({ stats: MOCK_STATS, loading: false, error: null });
  useCountries.mockReturnValue({ countries: MOCK_COUNTRIES, loading: false, error: null });
  useDailyData.mockReturnValue({ dailyData: MOCK_DAILY, loading: false, error: null });
}

afterEach(() => jest.clearAllMocks());

describe('App (integration — hooks mocked)', () => {
  test('shows loading spinner while any hook is loading', () => {
    // AC-P2 — LoadingSpinner rendered during data fetch
    useCovid19Stats.mockReturnValue({ stats: null, loading: true, error: null });
    useCountries.mockReturnValue({ countries: [], loading: false, error: null });
    useDailyData.mockReturnValue({ dailyData: [], loading: false, error: null });

    const { container } = render(<App />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  test('hides spinner once all hooks have resolved', () => {
    // AC-P2 — spinner disappears after load
    mockAllLoaded();
    const { container } = render(<App />);
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
  });

  test('shows error message when stats hook returns an error', () => {
    // AC-P2 — error banner displayed on API failure
    useCovid19Stats.mockReturnValue({
      stats: null,
      loading: false,
      error: 'Failed to load statistics. Please try again later.',
    });
    useCountries.mockReturnValue({ countries: [], loading: false, error: null });
    useDailyData.mockReturnValue({ dailyData: [], loading: false, error: null });

    const { getByText } = render(<App />);
    expect(getByText('Failed to load statistics. Please try again later.')).toBeInTheDocument();
  });

  test('shows error message when countries hook returns an error', () => {
    // AC-P2 — any hook error surfaces to the user
    useCovid19Stats.mockReturnValue({ stats: MOCK_STATS, loading: false, error: null });
    useCountries.mockReturnValue({
      countries: [],
      loading: false,
      error: 'Failed to load countries. Please try again later.',
    });
    useDailyData.mockReturnValue({ dailyData: [], loading: false, error: null });

    const { getByText } = render(<App />);
    expect(getByText('Failed to load countries. Please try again later.')).toBeInTheDocument();
  });

  test('renders content area (Cards heading) when all hooks succeed', () => {
    // AC-P1 — main happy path: Stats + Countries + DailyData all succeed
    mockAllLoaded();
    const { getByText } = render(<App />);
    // Cards renders "Global" heading for no-country state
    expect(getByText('Global')).toBeInTheDocument();
  });

  test('renders country picker options from hook when loaded', () => {
    // AC-P3 — CountryPicker receives countries prop from hook
    mockAllLoaded();
    const { getByText } = render(<App />);
    expect(getByText('Germany')).toBeInTheDocument();
    expect(getByText('France')).toBeInTheDocument();
  });

  test('does not show error banner when all hooks succeed', () => {
    // AC-P2 regression — no spurious error banner on success
    mockAllLoaded();
    const { queryByText } = render(<App />);
    expect(queryByText(/failed to load/i)).toBeNull();
  });
});
