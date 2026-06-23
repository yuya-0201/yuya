import { kv } from "@vercel/kv";
import { Alert } from "./types";

const ALERTS_KEY = "alerts";

export async function readAlerts(): Promise<Alert[]> {
  const alerts = await kv.get<Alert[]>(ALERTS_KEY);
  return alerts ?? [];
}

export async function writeAlerts(alerts: Alert[]): Promise<void> {
  await kv.set(ALERTS_KEY, alerts);
}

export async function addAlert(alert: Omit<Alert, "id" | "createdAt">): Promise<Alert> {
  const alerts = await readAlerts();
  const newAlert: Alert = {
    ...alert,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  await writeAlerts(alerts);
  return newAlert;
}

export async function deleteAlert(id: string): Promise<boolean> {
  const alerts = await readAlerts();
  const filtered = alerts.filter((a) => a.id !== id);
  if (filtered.length === alerts.length) return false;
  await writeAlerts(filtered);
  return true;
}

export async function updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
  const alerts = await readAlerts();
  const index = alerts.findIndex((a) => a.id === id);
  if (index === -1) return null;
  alerts[index] = { ...alerts[index], ...updates };
  await writeAlerts(alerts);
  return alerts[index];
}
