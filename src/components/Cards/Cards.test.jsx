// Component tests for Cards (Info) — Redmine #16.
// Verifies the four explicit async states — loading / error / empty / ready —
// so a failed fetch shows a distinct error + working Retry instead of a permanent
// "Loading…" (closes P1 UX). Values come from the adapter DTO, never raw .value (P2).
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Info from './Cards';

// CountUp animates over wall-clock; stub it to render its target deterministically.
jest.mock('react-countup', () => ({ __esModule: true, default: ({ end }) => end }));

describe('Cards (Info)', () => {
  it('renders a loading affordance for idle/loading status', () => {
    const { getByText } = render(<Info status="loading" />);
    expect(getByText('Loading…')).toBeInTheDocument();
  });

  it('renders a distinct error message with a working Retry (closes P1)', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <Info status="error" error={{ code: 'NETWORK', message: 'Network down' }} onRetry={onRetry} />,
    );
    expect(getByText('Network down')).toBeInTheDocument();
    fireEvent.click(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('falls back to a generic error message when the error has no message', () => {
    const { getByText } = render(<Info status="error" error={{}} onRetry={jest.fn()} />);
    expect(getByText('Unable to load data.')).toBeInTheDocument();
  });

  it('renders an empty state when successful but data is null', () => {
    const { getByText } = render(<Info status="success" data={null} />);
    expect(getByText('No data available.')).toBeInTheDocument();
  });

  it('renders the three totals cards from the adapter DTO (no unguarded .value, P2)', () => {
    const { getByText } = render(
      <Info status="success" data={{ confirmed: 100, recovered: 60, deaths: 5, lastUpdate: null }} />,
    );
    expect(getByText('Global')).toBeInTheDocument();
    expect(getByText('Infected')).toBeInTheDocument();
    expect(getByText('Recovered')).toBeInTheDocument();
    expect(getByText('Deaths')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('60')).toBeInTheDocument();
    expect(getByText('5')).toBeInTheDocument();
  });
});
