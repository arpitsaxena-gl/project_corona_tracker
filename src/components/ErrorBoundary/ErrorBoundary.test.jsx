import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowingChild = () => {
  throw new Error('Test render error');
};

const SafeChild = () => <div>child content</div>;

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders fallback UI when a child throws during render', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('calls console.error with error details when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('renders children normally when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <SafeChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
});
