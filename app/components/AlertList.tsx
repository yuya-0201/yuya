"use client";

import { Alert } from "@/lib/types";

interface Props {
  alerts: Alert[];
  onDeleted: () => void;
}

function technicalLabel(type: string): string {
  const map: Record<string, string> = {
    bb_upper_1: "BB上限1σ", bb_upper_2: "BB上限2σ", bb_upper_3: "BB上限3σ",
    bb_lower_1: "BB下限1σ", bb_lower_2: "BB下限2σ", bb_lower_3: "BB下限3σ",
    sma5_above: "5日SMA上抜け", sma5_below: "5日SMA下抜け",
    sma20_above: "20日SMA上抜け", sma20_below: "20日SMA下抜け",
    sma75_above: "75日SMA上抜け", sma75_below: "75日SMA下抜け",
    rsi_above_70: "RSI≥70", rsi_above_80: "RSI≥80",
    rsi_below_30: "RSI≤30", rsi_below_20: "RSI≤20",
  };
  return map[type] ?? type;
}

export default function AlertList({ alerts, onDeleted }: Props) {
  const handleDelete = async (id: string) => {
    await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onDeleted();
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center text-gray-500 text-sm">
        アラートが登録されていません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {alert.baseCurrency}/{alert.targetCurrency}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  alert.mode === "technical"
                    ? "bg-purple-900 text-purple-300"
                    : "bg-gray-800 text-gray-300"
                }`}>
                  {alert.mode === "technical" ? "テクニカル" : "価格"}
                </span>
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {alert.mode === "technical" && alert.technicalType
                  ? technicalLabel(alert.technicalType)
                  : `${alert.condition === "above" ? "≥" : "≤"} ${alert.threshold} ${alert.condition === "above" ? "以上で通知" : "以下で通知"}`
                }
              </div>
              {alert.lastTriggeredAt && (
                <div className="text-xs text-yellow-400 mt-1">
                  最終通知: {new Date(alert.lastTriggeredAt).toLocaleString("ja-JP")}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDelete(alert.id)}
              className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded transition-colors"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
