import fs from "fs";
import path from "path";
import { Alert, AlertsStore } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "alerts.json");

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ alerts: [] }));
}

export function readAlerts(): Alert[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  const store: AlertsStore = JSON.parse(raw);
  return store.alerts;
}

export function writeAlerts(alerts: Alert[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ alerts }, null, 2));
}

export function addAlert(alert: Omit<Alert, "id" | "createdAt">): Alert {
  const alerts = readAlerts();
  const newAlert: Alert = {
    ...alert,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  writeAlerts(alerts);
  return newAlert;
}

export function deleteAlert(id: string): boolean {
  const alerts = readAlerts();
  const filtered = alerts.filter((a) => a.id !== id);
  if (filtered.length === alerts.length) return false;
  writeAlerts(filtered);
  return true;
}

export function updateAlert(id: string, updates: Partial<Alert>): Alert | null {
  const alerts = readAlerts();
  const index = alerts.findIndex((a) => a.id === id);
  if (index === -1) return null;
  alerts[index] = { ...alerts[index], ...updates };
  writeAlerts(alerts);
  return alerts[index];
}
