import { useCallback, useEffect, useState } from 'react';
import { CURRENCIES } from '../constants';
import { computeRatesFromApi } from '../utils/rates';

export function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [manualRates, setManualRates] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshRates = useCallback(async (forceManualRefresh = false) => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      const currentManualRates = JSON.parse(localStorage.getItem('manual_rates_v1') || '{}');
      const savedRates = JSON.parse(localStorage.getItem('currency_rates_v3') || '{}') as Record<string, number>;

      setRates((prev) => {
        const fallbackRates = { ...savedRates, ...prev };
        return computeRatesFromApi({
          currencies: CURRENCIES,
          apiRates: data.rates || {},
          manualRates: currentManualRates,
          fallbackRates,
          forceManualRefresh,
        });
      });
    } catch (error) {
      console.error('Failed to fetch online rates', error);
    } finally {
      if (forceManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    const savedManualRates = localStorage.getItem('manual_rates_v1');
    if (savedManualRates) {
      setManualRates(JSON.parse(savedManualRates));
    }

    const savedRates = localStorage.getItem('currency_rates_v3');
    if (savedRates) {
      setRates(JSON.parse(savedRates));
    } else {
      const initialRates: Record<string, number> = {};
      CURRENCIES.forEach((c) => {
        initialRates[c.code] = c.defaultRate;
      });
      setRates(initialRates);
    }

    refreshRates(false);
  }, [refreshRates]);

  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      localStorage.setItem('currency_rates_v3', JSON.stringify(rates));
    }
  }, [rates]);

  useEffect(() => {
    if (!isRefreshing) return;
    refreshRates(true);
  }, [isRefreshing, refreshRates]);

  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
  }, []);

  const setManualRate = useCallback((currencyCode: string, rate: number) => {
    setRates((prev) => ({ ...prev, [currencyCode]: rate }));
    setManualRates((prev) => {
      const next = { ...prev, [currencyCode]: true };
      localStorage.setItem('manual_rates_v1', JSON.stringify(next));
      return next;
    });
  }, []);

  const setAutoRate = useCallback(async (currencyCode: string) => {
    setManualRates((prev) => {
      const next = { ...prev, [currencyCode]: false };
      localStorage.setItem('manual_rates_v1', JSON.stringify(next));
      return next;
    });
    await refreshRates(true);
  }, [refreshRates]);

  return { rates, manualRates, isRefreshing, triggerRefresh, setManualRate, setAutoRate };
}
