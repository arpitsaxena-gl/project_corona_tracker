import React from 'react';
import { render, screen } from '@testing-library/react';
import Cards from './Cards';

const mockData = {
  confirmed: { value: 84576459 },
  recovered: { value: 59724428 },
  deaths: { value: 1836216 },
  lastUpdate: '2021-01-01T00:00:00.000Z',
};

describe('Cards', () => {
  it('renders a loading indicator while loading', () => {
    const { container } = render(<Cards loading={true} data={null} error={null} />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    expect(screen.queryByText('Infected')).not.toBeInTheDocument();
  });

  it('renders an error message when error is provided', () => {
    render(<Cards loading={false} data={null} error="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.queryByText('Infected')).not.toBeInTheDocument();
  });

  it('renders stat cards when data is available', () => {
    render(<Cards loading={false} data={mockData} error={null} />);
    expect(screen.getByText('Infected')).toBeInTheDocument();
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    expect(screen.getByText('Deaths')).toBeInTheDocument();
  });

  it('renders nothing when data is null and not loading', () => {
    const { container } = render(<Cards loading={false} data={null} error={null} />);
    expect(container.firstChild).toBeNull();
  });
});
