import { FxRate } from "./types";

const BASE_URL = "https://api.frankfurter.app";

export async function getLatestRates(base = "USD"): Promise<FxRate> {
  const res = await fetch(`${BASE_URL}/latest?from=${base}`);
  if (!res.ok) throw new Error(`Failed to fetch rates: ${res.statusText}`);
  return res.json();
}

export async function getRate(base: string, target: string): Promise<number> {
  const data = await getLatestRates(base);
  const rate = data.rates[target];
  if (rate === undefined) throw new Error(`Rate not found for ${base}/${target}`);
  return rate;
}

export const POPULAR_CURRENCIES = [
  "USD", "JPY", "EUR", "GBP", "AUD", "CAD", "CHF", "CNY", "HKD", "SGD",
];
