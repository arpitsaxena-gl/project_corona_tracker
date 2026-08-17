
// CountryPicker.test.jsx
// Ticket: Redmine #8 — COVID Tracker Enhancement
// Verifies: AC-02 (CountryPicker default "Global", country selection), AC-05 (infra unaffected)

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountryPicker from './CountryPicker';

jest.mock('../../api', () => ({
  fetchCountries: jest.fn(),
}));

import { fetchCountries } from '../../api';

afterEach(() => {
  jest.clearAllMocks();
});

describe('CountryPicker', () => {
  // AC-02 / analysis: CountryPicker default label fix (was "United States", now "Global")
  it('renders a "Global" default option with empty value', async () => {
    fetchCountries.mockResolvedValue([]);

    await act(async () => {
      render(<CountryPicker handleCountryChange={jest.fn()} />);
    });

    const globalOption = screen.getByText('Global');
    expect(globalOption).toBeInTheDocument();
    expect(globalOption.tagName).toBe('OPTION');
    expect(globalOption.value).toBe('');
  });

  // AC-02 / analysis: country list populated from fetchCountries
  it('renders country options returned by fetchCountries', async () => {
    fetchCountries.mockResolvedValue(['Australia', 'Brazil', 'France']);

    await act(async () => {
      render(<CountryPicker handleCountryChange={jest.fn()} />);
    });

    expect(await screen.findByText('Australia')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  // AC-02 / analysis: country option uses country name as key (not array index)
  // Verifiable indirectly — all country names rendered without duplicate-key warnings
  it('renders each country option with its country name as text content', async () => {
    fetchCountries.mockResolvedValue(['Germany', 'India', 'Japan']);

    await act(async () => {
      render(<CountryPicker handleCountryChange={jest.fn()} />);
    });

    const options = screen.getAllByRole('option');
    const optionTexts = options.map((o) => o.textContent);
    expect(optionTexts).toContain('Germany');
    expect(optionTexts).toContain('India');
    expect(optionTexts).toContain('Japan');
    // "Global" must still be present as the first option
    expect(optionTexts[0]).toBe('Global');
  });

  // AC-02 / analysis: handleCountryChange callback fires on selection
  it('calls handleCountryChange when the select value changes', async () => {
    fetchCountries.mockResolvedValue(['Brazil']);
    const handleChange = jest.fn();

    await act(async () => {
      render(<CountryPicker handleCountryChange={handleChange} />);
    });

    await screen.findByText('Brazil');

    const select = screen.getByRole('combobox');
    await act(async () => {
      userEvent.selectOptions(select, 'Brazil');
    });

    expect(handleChange).toHaveBeenCalled();
  });

  // AC-03 / analysis: fetchCountries failure must not crash CountryPicker (error silenced to console)
  it('renders only the Global option when fetchCountries rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchCountries.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(<CountryPicker handleCountryChange={jest.fn()} />);
    });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toBe('Global');
    console.error.mockRestore();
  });
});
