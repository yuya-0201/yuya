export type AlertCondition = "above" | "below";

// テクニカルアラートの種類
export type TechnicalType =
  | "bb_upper_1" | "bb_upper_2" | "bb_upper_3"  // BB上限 1σ/2σ/3σ
  | "bb_lower_1" | "bb_lower_2" | "bb_lower_3"  // BB下限 1σ/2σ/3σ
  | "sma5_above" | "sma5_below"                   // 5日SMA上抜け/下抜け
  | "sma20_above" | "sma20_below"                 // 20日SMA上抜け/下抜け
  | "sma75_above" | "sma75_below"                 // 75日SMA上抜け/下抜け
  | "rsi_above_70" | "rsi_above_80"               // RSI買われすぎ
  | "rsi_below_30" | "rsi_below_20";              // RSI売られすぎ

export type AlertMode = "price" | "technical";

export interface Alert {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  mode: AlertMode;
  // price mode
  condition?: AlertCondition;
  threshold?: number;
  // technical mode
  technicalType?: TechnicalType;
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
