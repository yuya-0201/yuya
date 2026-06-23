import { FxRate } from "./types";

const BASE_URL = "https://api.frankfurter.app";

export async function getHistoricalRates(base: string, target: string, days: number): Promise<number[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Math.ceil(days * 1.5)); // 週末考慮で多めに取得
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const res = await fetch(`${BASE_URL}/${fmt(start)}..${fmt(end)}?from=${base}&to=${target}`);
  if (!res.ok) throw new Error(`Failed to fetch historical rates`);
  const data = await res.json();
  const prices: number[] = Object.values(data.rates as Record<string, Record<string, number>>)
    .map((r) => r[target])
    .filter((v): v is number => v !== undefined);
  return prices.slice(-days);
}

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
