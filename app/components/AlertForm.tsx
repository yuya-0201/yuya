"use client";

import { useState } from "react";
import { POPULAR_CURRENCIES } from "@/lib/fx";

interface Props {
  onAdded: () => void;
}

export default function AlertForm({ onAdded }: Props) {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("JPY");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState("");
  const [lineToken, setLineToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!threshold || !lineToken) {
      setError("すべての項目を入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseCurrency,
          targetCurrency,
          condition,
          threshold: parseFloat(threshold),
          lineToken,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "エラーが発生しました");
      } else {
        setSuccess(true);
        setThreshold("");
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
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {POPULAR_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">対象通貨</label>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {POPULAR_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">条件</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as "above" | "below")}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="above">以上になったら通知</option>
          <option value="below">以下になったら通知</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          レート ({baseCurrency}/{targetCurrency})
        </label>
        <input
          type="number"
          step="any"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="例: 155.00"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">LINE Notify トークン</label>
        <input
          type="text"
          value={lineToken}
          onChange={(e) => setLineToken(e.target.value)}
          placeholder="トークンを貼り付け"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">アラートを登録しました</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
      >
        {loading ? "登録中..." : "アラートを登録"}
      </button>
    </form>
  );
}
