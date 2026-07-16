import React from 'react';
import { render, waitFor } from '@testing-library/react';
import CountryPicker from './CountryPicker';
import { fetchCountries } from '../../api';

jest.mock('../../api', () => ({
  fetchCountries: jest.fn(),
}));

describe('CountryPicker', () => {
  test('default option label is Global', async () => {
    fetchCountries.mockResolvedValue(['India', 'Brazil']);
    const { getByDisplayValue, findByText } = render(
      <CountryPicker handleCountryChange={jest.fn()} />,
    );
    await findByText('India');
    const select = getByDisplayValue('Global');
    expect(select).toBeTruthy();
    expect(select.tagName).toBe('SELECT');
  });

  test('disables select when countries fail to load', async () => {
    fetchCountries.mockRejectedValue(new Error('network'));
    const { getByDisplayValue } = render(
      <CountryPicker handleCountryChange={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByDisplayValue('Global').disabled).toBe(true);
    });
  });
});
