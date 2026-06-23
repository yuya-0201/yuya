"use client";

import { useState, useEffect, useCallback } from "react";
import { TradeRecord } from "@/lib/types";
import TradeForm from "../components/TradeForm";
import TradeList from "../components/TradeList";
import Link from "next/link";

export default function JournalPage() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    const res = await fetch("/api/trades");
    setTrades(await res.json());
  }, []);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const totalPnL = trades.reduce((acc, t) => {
    const pnl = t.direction === "buy"
      ? (t.exitRate - t.entryRate) * t.lotSize
      : (t.entryRate - t.exitRate) * t.lotSize;
    return acc + pnl;
  }, 0);

  const handleOverallAnalysis = async () => {
    setAnalyzing(true);
    setSummary(null);
    try {
      const res = await fetch("/api/trades/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: null }),
      });
      const data = await res.json();
      setSummary(data.analysis);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">トレード日誌</h1>
            <p className="text-gray-400 mt-1">トレードを記録してAIに分析してもらう</p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 transition-colors mt-2">
            ← FXアラートに戻る
          </Link>
        </header>

        {trades.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-8 flex items-center justify-between">
            <div className="flex gap-6 text-sm">
              <span className="text-gray-400">記録件数: <span className="text-white font-semibold">{trades.length}件</span></span>
              <span className="text-gray-400">累計損益:
                <span className={`font-semibold ml-1 ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(4)}
                </span>
              </span>
            </div>
            <button onClick={handleOverallAnalysis} disabled={analyzing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
              {analyzing ? "分析中..." : "全体AI分析"}
            </button>
          </div>
        )}

        {summary && (
          <div className="bg-purple-950 border border-purple-800 rounded-xl p-5 mb-8">
            <h3 className="text-purple-300 font-semibold mb-2">AI総合分析</h3>
            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{summary}</div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-blue-300">トレードを記録</h2>
            <TradeForm onAdded={fetchTrades} />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-blue-300">トレード履歴</h2>
            <TradeList trades={trades} onDeleted={fetchTrades} onAnalyzed={fetchTrades} />
          </section>
        </div>
      </div>
    </main>
  );
}
