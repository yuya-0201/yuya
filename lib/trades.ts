import { kv } from "@vercel/kv";
import { TradeRecord } from "./types";

const TRADES_KEY = "trades";

export async function getTrades(): Promise<TradeRecord[]> {
  const trades = await kv.get<TradeRecord[]>(TRADES_KEY);
  return trades ?? [];
}

async function writeTrades(trades: TradeRecord[]): Promise<void> {
  await kv.set(TRADES_KEY, trades);
}

export async function addTrade(trade: Omit<TradeRecord, "id" | "createdAt">): Promise<TradeRecord> {
  const trades = await getTrades();
  const newTrade: TradeRecord = {
    ...trade,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  trades.unshift(newTrade);
  await writeTrades(trades);
  return newTrade;
}

export async function updateTradeAnalysis(id: string, analysis: string): Promise<void> {
  const trades = await getTrades();
  const trade = trades.find((t) => t.id === id);
  if (trade) {
    trade.analysis = analysis;
    await writeTrades(trades);
  }
}

export async function deleteTrade(id: string): Promise<void> {
  const trades = await getTrades();
  await writeTrades(trades.filter((t) => t.id !== id));
}
