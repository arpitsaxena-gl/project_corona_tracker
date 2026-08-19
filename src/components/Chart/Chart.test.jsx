// COVID-19 Tracker — Chart component tests | Ticket: COVID-19
// Verifies: AC-P3 (bar/line switch), AC-P1 (dailyData as array not object), field_validations.general[1,2]
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Chart from './Chart';

// Canvas is not available in jsdom — mock chart components
jest.mock('react-chartjs-2', () => ({
  Line: (props) => <canvas data-testid="line-chart" aria-label="line-chart" />,
  Bar:  (props) => <canvas data-testid="bar-chart"  aria-label="bar-chart" />,
}));

const mockStats = {
  confirmed: { value: 1000 },
  recovered: { value: 800 },
  deaths:    { value: 50 },
};

const mockDailyData = [
  { confirmed: 100, recovered: 80, deaths: 5, date: '1/1/21' },
  { confirmed: 200, recovered: 150, deaths: 10, date: '1/2/21' },
];

describe('Chart component', () => {
  test('shows bar chart when country is truthy and data.confirmed is present', () => {
    // AC-P3 / validation_classifications.business[0] — country → bar chart
    const { getByTestId, queryByTestId } = render(
      <Chart data={mockStats} country="Germany" dailyData={mockDailyData} />
    );
    expect(getByTestId('bar-chart')).toBeInTheDocument();
    expect(queryByTestId('line-chart')).toBeNull();
  });

  test('shows line chart when no country and dailyData is a non-empty array', () => {
    // AC-P3 / validation_classifications.conditional[1] — no country → line chart
    const { getByTestId, queryByTestId } = render(
      <Chart data={null} country="" dailyData={mockDailyData} />
    );
    expect(getByTestId('line-chart')).toBeInTheDocument();
    expect(queryByTestId('bar-chart')).toBeNull();
  });

  test('shows no chart when no country and dailyData is empty array', () => {
    // AC-P1 regression: dailyData=[] must not crash and renders nothing
    const { queryByTestId } = render(
      <Chart data={null} country="" dailyData={[]} />
    );
    expect(queryByTestId('line-chart')).toBeNull();
    expect(queryByTestId('bar-chart')).toBeNull();
  });

  test('shows no chart when no country and dailyData is null', () => {
    // AC-P1 / field_validations.general[1] — Array.isArray guard handles null
    const { queryByTestId } = render(
      <Chart data={null} country="" dailyData={null} />
    );
    expect(queryByTestId('line-chart')).toBeNull();
    expect(queryByTestId('bar-chart')).toBeNull();
  });

  test('shows no bar chart when country is set but data is null', () => {
    // AC-P3 — data?.confirmed guard; no confirmed → no bar chart
    const { queryByTestId } = render(
      <Chart data={null} country="Germany" dailyData={[]} />
    );
    expect(queryByTestId('bar-chart')).toBeNull();
  });

  test('does not crash when dailyData is an empty object (regression)', () => {
    // AC-P1 regression: prior bug initialized dailyData as {} not []
    // Array.isArray({}) === false, so no line chart rendered, but no throw either
    expect(() =>
      render(<Chart data={null} country="" dailyData={{}} />)
    ).not.toThrow();
  });

  test('renders correctly in a country view with full data', () => {
    // AC-P3 integration: full country props → bar chart present
    const { getByTestId } = render(
      <Chart data={mockStats} country="France" dailyData={mockDailyData} />
    );
    expect(getByTestId('bar-chart')).toBeInTheDocument();
  });
});
