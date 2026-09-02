// Component tests for CardComponent — Redmine #16.
// Field-level checks: value is coerced to a finite number (never NaN into CountUp)
// and the "last updated" line is omitted when lastUpdate is null.
import React from 'react';
import { render } from '@testing-library/react';

import CardComponent from './Card';

jest.mock('react-countup', () => ({ __esModule: true, default: ({ end }) => end }));

const base = { cardTitle: 'Infected', value: 100, cardSubtitle: 'Number of active cases.' };

describe('CardComponent', () => {
  it('renders the title, animated value and subtitle', () => {
    const { getByText } = render(<CardComponent {...base} />);
    expect(getByText('Infected')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('Number of active cases.')).toBeInTheDocument();
  });

  it('omits the "last updated" line when lastUpdate is null', () => {
    const { queryByText } = render(<CardComponent {...base} lastUpdate={null} />);
    // No date string (would contain a 4-digit year) should be present.
    expect(queryByText(/\b\d{4}\b/)).toBeNull();
  });

  it('shows the formatted date when lastUpdate is provided', () => {
    const ts = Date.UTC(2026, 8, 1); // 2026-09-01
    const { getByText } = render(<CardComponent {...base} lastUpdate={ts} />);
    expect(getByText(new Date(ts).toDateString())).toBeInTheDocument();
  });

  it('coerces a non-numeric value to 0 (never NaN into CountUp)', () => {
    const { getByText } = render(<CardComponent {...base} value="not-a-number" />);
    expect(getByText('0')).toBeInTheDocument();
  });
});
