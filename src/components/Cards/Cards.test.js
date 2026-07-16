import React from 'react';
import { render, screen } from '@testing-library/react';
import Cards from './Cards';

const sampleData = {
  confirmed: { value: 100 },
  recovered: { value: 80 },
  deaths: { value: 5 },
  lastUpdate: '2020-04-01T00:00:00.000Z',
};

describe('Cards', () => {
  it('shows Loading when status is loading', () => {
    const { container } = render(
      <Cards data={sampleData} country="" status="loading" />,
    );
    expect(container.textContent).toContain('Loading...');
  });

  it('titles Global when country is empty', () => {
    render(<Cards data={sampleData} country="" status="success" />);
    expect(screen.getByRole('heading', { name: 'Global' })).toBeInTheDocument();
  });

  it('titles selected country when provided', () => {
    render(<Cards data={sampleData} country="India" status="success" />);
    expect(screen.getByRole('heading', { name: 'India' })).toBeInTheDocument();
  });
});
