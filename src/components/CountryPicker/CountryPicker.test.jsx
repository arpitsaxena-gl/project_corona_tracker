// Component tests for CountryPicker (Countries) — Redmine #16.
// The service is mocked so the fetch is deterministic and offline. Verifies the
// enabled/populated path (onChange callback), the empty-list affordance, and the
// error affordance — the dropdown is never silently broken (P5).
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import Countries from './CountryPicker';
import { getCountries } from '../../services/covidService';
import { ok, fail, AppError, ErrorCode } from '../../api/errors';

jest.mock('../../services/covidService');

afterEach(() => jest.resetAllMocks());

async function renderPicker(onChange = jest.fn()) {
  let utils;
  // act(async) flushes the mount effect and the resolved service promise.
  await act(async () => {
    utils = render(<Countries handleCountryChange={onChange} />);
  });
  return { ...utils, onChange };
}

describe('CountryPicker (Countries)', () => {
  it('renders the fetched countries, enables the select, and reports selection', async () => {
    getCountries.mockResolvedValue(ok([{ name: 'India' }, { name: 'USA' }]));
    const { getByRole, getByText, onChange } = await renderPicker();

    const select = getByRole('combobox');
    expect(select).not.toBeDisabled();
    expect(getByText('India')).toBeInTheDocument();
    expect(getByText('USA')).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'India' } });
    expect(onChange).toHaveBeenCalledWith('India');
  });

  it('disables the select and shows a message when the list is empty', async () => {
    getCountries.mockResolvedValue(ok([]));
    const { getByRole, getByText } = await renderPicker();
    expect(getByRole('combobox')).toBeDisabled();
    expect(getByText('No countries available.')).toBeInTheDocument();
  });

  it('shows an error affordance and disables the select on fetch failure', async () => {
    getCountries.mockResolvedValue(fail(new AppError(ErrorCode.HTTP, '500')));
    const { getByRole, getByText } = await renderPicker();
    expect(getByText('Unable to load countries.')).toBeInTheDocument();
    expect(getByRole('combobox')).toBeDisabled();
  });
});
