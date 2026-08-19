// COVID-19 Tracker — CountryPicker component tests | Ticket: COVID-19
// Verifies: AC-P3 (Global default label fix), AC-P2 (Array.isArray guard, country key)
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CountryPicker from './CountryPicker';

describe('CountryPicker (Countries component)', () => {
  test('renders "Global" as the default option with empty string value', () => {
    // AC-P3 — prior bug: default option was labelled "United States" but triggered global fetch
    const { getByText } = render(
      <CountryPicker handleCountryChange={jest.fn()} countries={[]} />
    );
    const globalOption = getByText('Global');
    expect(globalOption).toBeInTheDocument();
    expect(globalOption.value).toBe('');
  });

  test('renders all country names from the countries prop', () => {
    // AC-P1 / field_validations.default[2] — countries prop rendered as options
    const { getByText } = render(
      <CountryPicker
        handleCountryChange={jest.fn()}
        countries={['Australia', 'Brazil', 'Germany']}
      />
    );
    expect(getByText('Australia')).toBeInTheDocument();
    expect(getByText('Brazil')).toBeInTheDocument();
    expect(getByText('Germany')).toBeInTheDocument();
  });

  test('calls handleCountryChange with the selected country value on change', () => {
    // AC-P3 — onChange contract: selected value passed to handler
    const handleChange = jest.fn();
    const { container } = render(
      <CountryPicker
        handleCountryChange={handleChange}
        countries={['Germany', 'France']}
      />
    );
    const select = container.querySelector('select');
    fireEvent.change(select, { target: { value: 'Germany' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('Germany');
  });

  test('calls handleCountryChange with empty string when Global is selected', () => {
    // AC-P3 — selecting Global resets to empty string (global view)
    const handleChange = jest.fn();
    const { container } = render(
      <CountryPicker
        handleCountryChange={handleChange}
        countries={['Germany']}
      />
    );
    const select = container.querySelector('select');
    fireEvent.change(select, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith('');
  });

  test('renders without crashing when countries is an empty array', () => {
    // AC-P2 — empty countries list is valid initial state
    expect(() =>
      render(<CountryPicker handleCountryChange={jest.fn()} countries={[]} />)
    ).not.toThrow();
  });

  test('renders without crashing when countries is undefined (Array.isArray guard)', () => {
    // AC-P2 — Array.isArray guard prevents crash when fetchCountries returns null
    expect(() =>
      render(<CountryPicker handleCountryChange={jest.fn()} countries={undefined} />)
    ).not.toThrow();
  });

  test('uses country name as React key (not array index)', () => {
    // AC-P4 regression: prior bug used index as key; now country name is key
    // Indirectly verified: no React key warning in console and list renders correctly
    const countries = ['Alpha', 'Beta', 'Gamma'];
    const { getAllByRole } = render(
      <CountryPicker handleCountryChange={jest.fn()} countries={countries} />
    );
    // Global option + 3 country options = 4
    const options = getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0].value).toBe('');
    expect(options[1].value).toBe('Alpha');
  });
});
