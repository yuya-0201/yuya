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
