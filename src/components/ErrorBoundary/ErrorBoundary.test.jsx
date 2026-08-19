// COVID-19 Tracker — ErrorBoundary component tests | Ticket: COVID-19
// Verifies: AC-P2 (error boundary catches render errors, shows Try Again, resets state)
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ErrorBoundary from './ErrorBoundary';

// Suppress React's own console.error noise for expected boundary catches
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

const ThrowingChild = ({ message = 'Test render error' }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  test('renders children when no render error occurs', () => {
    // AC-P2 — happy path: child renders normally
    const { getByText } = render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    expect(getByText('Normal content')).toBeInTheDocument();
  });

  test('shows "Something went wrong." heading when a child throws', () => {
    // AC-P2 — error UI is displayed on render exception
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(getByText('Something went wrong.')).toBeInTheDocument();
  });

  test('displays the thrown error message in the error UI', () => {
    // AC-P2 — error detail text shows error.message
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild message="Countries list is corrupt" />
      </ErrorBoundary>
    );
    expect(getByText('Countries list is corrupt')).toBeInTheDocument();
  });

  test('shows "Try Again" button when in error state', () => {
    // AC-P2 — recovery affordance is always present on error
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(getByText('Try Again')).toBeInTheDocument();
  });

  test('does not show children when in error state', () => {
    // AC-P2 — boundary swaps children for error UI, never shows both
    const { queryByText } = render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(queryByText('Normal content')).toBeNull();
  });

  test('resets error state and re-renders children on Try Again click', () => {
    // AC-P2 — handleReset restores children
    let shouldThrow = true;
    const Conditional = () => {
      if (shouldThrow) throw new Error('transient error');
      return <div>Recovered content</div>;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <Conditional />
      </ErrorBoundary>
    );

    // Initially in error state
    expect(getByText('Something went wrong.')).toBeInTheDocument();

    // Stop throwing, then click reset
    shouldThrow = false;
    fireEvent.click(getByText('Try Again'));

    expect(getByText('Recovered content')).toBeInTheDocument();
  });
});
