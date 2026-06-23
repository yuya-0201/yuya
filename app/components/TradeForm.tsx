"use client";

import { useState } from "react";
import { POPULAR_CURRENCIES } from "@/lib/fx";

interface Props {
  onAdded: () => void;
}

export default function TradeForm({ onAdded }: Props) {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("JPY");
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [entryRate, setEntryRate] = useState("");
  const [exitRate, setExitRate] = useState("");
  const [lotSize, setLotSize] = useState("1");
  const [goodPoints, setGoodPoints] = useState("");
  const [reflections, setReflections] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!entryRate || !exitRate) {
      setError("エントリー・エグジットレートを入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseCurrency, targetCurrency, direction, entryRate, exitRate, lotSize, goodPoints, reflections }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "エラーが発生しました");
      } else {
        setSuccess(true);
        setEntryRate(""); setExitRate(""); setGoodPoints(""); setReflections("");
        onAdded();
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">基準通貨</label>
          <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
            {POPULAR_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">対象通貨</label>
          <select value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
            {POPULAR_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">売買方向</label>
        <div className="flex gap-3">
          {(["buy", "sell"] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDirection(d)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                direction === d
                  ? d === "buy" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}>
              {d === "buy" ? "買い (Long)" : "売り (Short)"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">エントリーレート</label>
          <input type="number" step="any" value={entryRate} onChange={(e) => setEntryRate(e.target.value)}
            placeholder="例: 155.00"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">エグジットレート</label>
          <input type="number" step="any" value={exitRate} onChange={(e) => setExitRate(e.target.value)}
            placeholder="例: 156.00"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">ロット数</label>
          <input type="number" step="any" min="0" value={lotSize} onChange={(e) => setLotSize(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">良かった点</label>
        <textarea value={goodPoints} onChange={(e) => setGoodPoints(e.target.value)}
          rows={2} placeholder="例: エントリータイミングが良かった、損切りを迷わず実行できた"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm resize-none" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">反省点・改善したいこと</label>
        <textarea value={reflections} onChange={(e) => setReflections(e.target.value)}
          rows={2} placeholder="例: 利確が早すぎた、ニュースを確認せずにエントリーした"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm resize-none" />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">トレードを記録しました</p>}

      <button type="submit" disabled={loading}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium transition-colors">
        {loading ? "記録中..." : "トレードを記録"}
      </button>
    </form>
  );
}
