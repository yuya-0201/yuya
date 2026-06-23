import fs from "fs";
import path from "path";
import { TradeRecord, TradesStore } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TRADES_FILE = path.join(DATA_DIR, "trades.json");

function readStore(): TradesStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TRADES_FILE)) {
    fs.writeFileSync(TRADES_FILE, JSON.stringify({ trades: [] }));
  }
  return JSON.parse(fs.readFileSync(TRADES_FILE, "utf-8"));
}

function writeStore(store: TradesStore) {
  fs.writeFileSync(TRADES_FILE, JSON.stringify(store, null, 2));
}

export function getTrades(): TradeRecord[] {
  return readStore().trades;
}

export function addTrade(trade: Omit<TradeRecord, "id" | "createdAt">): TradeRecord {
  const store = readStore();
  const newTrade: TradeRecord = {
    ...trade,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.trades.unshift(newTrade);
  writeStore(store);
  return newTrade;
}

export function updateTradeAnalysis(id: string, analysis: string): void {
  const store = readStore();
  const trade = store.trades.find((t) => t.id === id);
  if (trade) {
    trade.analysis = analysis;
    writeStore(store);
  }
}

export function deleteTrade(id: string): void {
  const store = readStore();
  store.trades = store.trades.filter((t) => t.id !== id);
  writeStore(store);
}
