import { describe, expect, it } from 'vitest';
import { computeRatesFromApi } from './rates';
import { CURRENCIES } from '../constants';

describe('computeRatesFromApi', () => {
  it('keeps manual rates when not forcing refresh', () => {
    const fallbackRates = { VND: 1, USD: 26000, EUR: 30000 };
    const manualRates = { EUR: true };
    const result = computeRatesFromApi({
      currencies: CURRENCIES,
      apiRates: { VND: 26000, USD: 1, EUR: 0.9 },
      manualRates,
      fallbackRates,
      forceManualRefresh: false,
    });

    expect(result.EUR).toBe(30000);
  });

  it('updates manual rates when forcing refresh', () => {
    const fallbackRates = { VND: 1, USD: 26000, EUR: 30000 };
    const manualRates = { EUR: true };
    const result = computeRatesFromApi({
      currencies: CURRENCIES,
      apiRates: { VND: 26000, USD: 1, EUR: 0.5 },
      manualRates,
      fallbackRates,
      forceManualRefresh: true,
    });

    expect(result.EUR).toBe(Math.round(26000 / 0.5));
  });
});
