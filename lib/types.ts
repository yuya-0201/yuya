export type AlertCondition = "above" | "below";

export interface Alert {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  condition: AlertCondition;
  threshold: number;
  lineToken: string;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface AlertsStore {
  alerts: Alert[];
}

export interface FxRate {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export type TradeDirection = "buy" | "sell";

export interface TradeRecord {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  direction: TradeDirection;
  entryRate: number;
  exitRate: number;
  lotSize: number;
  goodPoints: string;
  reflections: string;
  createdAt: string;
  analysis?: string;
}

export interface TradesStore {
  trades: TradeRecord[];
}
