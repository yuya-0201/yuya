"use client";

import { Alert } from "@/lib/types";

interface Props {
  alerts: Alert[];
  onDeleted: () => void;
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
              <div className="font-semibold text-white">
                {alert.baseCurrency}/{alert.targetCurrency}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {alert.condition === "above" ? "≥" : "≤"} {alert.threshold}
                <span className="ml-2 text-xs text-gray-500">
                  {alert.condition === "above" ? "以上で通知" : "以下で通知"}
                </span>
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
          <div className="mt-2 text-xs text-gray-600 font-mono truncate">
            TOKEN: {alert.lineToken.slice(0, 8)}...
          </div>
        </div>
      ))}
    </div>
  );
}
