import React from 'react';
import { render } from '@testing-library/react';
import Cards from './Cards';

describe('Cards', () => {
  test('shows loading when confirmed is missing', () => {
    const { container } = render(<Cards data={{}} country="" status="loading" />);
    expect(container.textContent).toContain('Loading...');
  });

  test('titles Global by default and country when set', () => {
    const data = {
      confirmed: { value: 10 },
      recovered: { value: null },
      deaths: { value: 1 },
      lastUpdate: '2020-01-01T00:00:00.000Z',
    };
    const globalView = render(<Cards data={data} country="" status="success" />);
    expect(globalView.getByText('Global')).toBeTruthy();
    globalView.unmount();

    const countryView = render(<Cards data={data} country="India" status="success" />);
    expect(countryView.getByText('India')).toBeTruthy();
  });

  test('renders N/A for null recovered', () => {
    const data = {
      confirmed: { value: 10 },
      recovered: { value: null },
      deaths: { value: 1 },
      lastUpdate: '2020-01-01T00:00:00.000Z',
    };
    const { getAllByText } = render(<Cards data={data} country="Global" status="success" />);
    expect(getAllByText('N/A').length).toBeGreaterThanOrEqual(1);
  });
});
