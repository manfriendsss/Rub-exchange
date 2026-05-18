import { Currency } from '../types';

export function computeRatesFromApi(params: {
  currencies: Currency[];
  apiRates: Record<string, number>;
  manualRates: Record<string, boolean>;
  fallbackRates: Record<string, number>;
  forceManualRefresh: boolean;
}): Record<string, number> {
  const { currencies, apiRates, manualRates, fallbackRates, forceManualRefresh } = params;
  const usdToVnd = apiRates.VND;
  if (!usdToVnd) return fallbackRates;

  const newRates: Record<string, number> = {};

  currencies.forEach((c) => {
    if (manualRates[c.code] && !forceManualRefresh) {
      newRates[c.code] = fallbackRates[c.code] ?? c.defaultRate;
      return;
    }

    if (c.code === 'VND') {
      newRates[c.code] = 1;
      return;
    }

    if (c.code === 'USD') {
      newRates[c.code] = Math.round(usdToVnd);
      return;
    }

    const usdToTarget = apiRates[c.code];
    if (usdToTarget) {
      newRates[c.code] = Math.round(usdToVnd / usdToTarget);
    } else {
      newRates[c.code] = fallbackRates[c.code] ?? c.defaultRate;
    }
  });

  return newRates;
}
