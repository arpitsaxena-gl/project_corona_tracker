import React from 'react';
import { render, screen } from '@testing-library/react';
import CountryPicker from './CountryPicker';

jest.mock('../../api', () => ({
  fetchCountries: jest.fn(() => Promise.resolve({ ok: true, data: ['India'] })),
}));

describe('CountryPicker', () => {
  it('defaults to Global with empty value', () => {
    render(
      <CountryPicker
        handleCountryChange={() => {}}
        countries={['India', 'Brazil']}
      />,
    );
    const globalOption = screen.getByRole('option', { name: 'Global' });
    expect(globalOption).toBeInTheDocument();
    expect(globalOption.value).toBe('');
  });
});
