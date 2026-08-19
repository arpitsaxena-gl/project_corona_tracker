// COVID-19 Tracker — Cards component tests | Ticket: COVID-19
// Verifies: AC-P3 (dynamic heading), AC-P2 (null-safety), field_validations.general[0]
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Cards from './Cards';

const mockData = {
  confirmed: { value: 1000 },
  recovered: { value: 800 },
  deaths:    { value: 50 },
  lastUpdate: '2021-01-01T00:00:00.000Z',
};

describe('Cards (Info component)', () => {
  test('renders null when data prop is null', () => {
    // AC-P2 / field_validations.general[0] — null-safety guard
    const { container } = render(<Cards data={null} country="" />);
    expect(container.firstChild).toBeNull();
  });

  test('renders null when data.confirmed is absent', () => {
    // AC-P2 / field_validations.general[0] — confirmed presence check
    const { container } = render(
      <Cards data={{ recovered: { value: 800 }, deaths: { value: 50 } }} country="" />
    );
    expect(container.firstChild).toBeNull();
  });

  test('shows "Global" heading when country prop is empty string', () => {
    // AC-P3 — dynamic heading fix (was always "Global" even for country views)
    const { getByText } = render(<Cards data={mockData} country="" />);
    expect(getByText('Global')).toBeInTheDocument();
  });

  test('shows country name in heading when country prop is set', () => {
    // AC-P3 — heading should reflect the selected country
    const { getByText } = render(<Cards data={mockData} country="Germany" />);
    expect(getByText('Germany')).toBeInTheDocument();
  });

  test('does not show "Global" heading when a country is selected', () => {
    // AC-P3 regression — old code always showed Global regardless of country
    const { queryByText } = render(<Cards data={mockData} country="Brazil" />);
    expect(queryByText('Global')).toBeNull();
  });

  test('renders Infected card title', () => {
    const { getByText } = render(<Cards data={mockData} country="" />);
    expect(getByText('Infected')).toBeInTheDocument();
  });

  test('renders Recovered card title', () => {
    const { getByText } = render(<Cards data={mockData} country="" />);
    expect(getByText('Recovered')).toBeInTheDocument();
  });

  test('renders Deaths card title', () => {
    const { getByText } = render(<Cards data={mockData} country="" />);
    expect(getByText('Deaths')).toBeInTheDocument();
  });

  test('renders zero values via ?? fallback without crashing', () => {
    // AC-P2 — ?? 0 fallback on null/undefined numeric values
    const zeroData = {
      confirmed: { value: null },
      recovered: { value: undefined },
      deaths:    { value: 0 },
      lastUpdate: '2021-01-01T00:00:00.000Z',
    };
    expect(() => render(<Cards data={zeroData} country="" />)).not.toThrow();
  });
});
