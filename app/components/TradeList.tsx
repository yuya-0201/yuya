"use client";

import { useState } from "react";
import { TradeRecord } from "@/lib/types";

interface Props {
  trades: TradeRecord[];
  onDeleted: () => void;
  onAnalyzed: () => void;
}

export default function TradeList({ trades, onDeleted, onAnalyzed }: Props) {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await fetch("/api/trades", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onDeleted();
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzing(id);
    try {
      await fetch("/api/trades/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      onAnalyzed();
      setExpanded(id);
    } finally {
      setAnalyzing(null);
    }
  };

  if (trades.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center text-gray-500 text-sm">
        トレード記録がありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trades.map((trade) => {
        const pnl = trade.direction === "buy"
          ? (trade.exitRate - trade.entryRate) * trade.lotSize
          : (trade.entryRate - trade.exitRate) * trade.lotSize;
        const isProfit = pnl >= 0;

        return (
          <div key={trade.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{trade.baseCurrency}/{trade.targetCurrency}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    trade.direction === "buy" ? "bg-blue-900 text-blue-300" : "bg-red-900 text-red-300"
                  }`}>
                    {trade.direction === "buy" ? "買い" : "売り"}
                  </span>
                  <span className={`text-sm font-mono font-semibold ${isProfit ? "text-green-400" : "text-red-400"}`}>
                    {isProfit ? "+" : ""}{pnl.toFixed(4)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {trade.entryRate} → {trade.exitRate} / {trade.lotSize}lot
                  <span className="ml-2">{new Date(trade.createdAt).toLocaleDateString("ja-JP")}</span>
                </div>
                {trade.goodPoints && (
                  <div className="text-xs text-green-400 mt-1">✓ {trade.goodPoints}</div>
                )}
                {trade.reflections && (
                  <div className="text-xs text-yellow-400 mt-0.5">△ {trade.reflections}</div>
                )}
              </div>
              <div className="flex gap-2 ml-2 shrink-0">
                <button onClick={() => handleAnalyze(trade.id)} disabled={analyzing === trade.id}
                  className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded transition-colors disabled:opacity-50">
                  {analyzing === trade.id ? "分析中..." : "AI分析"}
                </button>
                <button onClick={() => handleDelete(trade.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded transition-colors">
                  削除
                </button>
              </div>
            </div>

            {trade.analysis && (
              <div className="mt-3">
                <button onClick={() => setExpanded(expanded === trade.id ? null : trade.id)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  {expanded === trade.id ? "▲ AI分析を閉じる" : "▼ AI分析を見る"}
                </button>
                {expanded === trade.id && (
                  <div className="mt-2 bg-gray-800 rounded-lg p-3 text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {trade.analysis}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
