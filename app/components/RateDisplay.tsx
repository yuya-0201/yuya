"use client";

import { useState, useEffect } from "react";
import { POPULAR_CURRENCIES } from "@/lib/fx";

interface Rates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export default function RateDisplay() {
  const [base, setBase] = useState("USD");
  const [data, setData] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/rates?base=${base}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("レート取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [base]);

  const displayCurrencies = POPULAR_CURRENCIES.filter((c) => c !== base);

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-green-300">現在の為替レート</h2>
        <select
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        >
          {POPULAR_CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {data && <span className="text-xs text-gray-500">更新日: {data.date}</span>}
      </div>

      {loading && <p className="text-gray-400 text-sm">読み込み中...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {data && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {displayCurrencies.map((currency) => {
            const rate = data.rates[currency];
            if (!rate) return null;
            return (
              <div key={currency} className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">{base}/{currency}</div>
                <div className="text-sm font-mono font-semibold mt-1">
                  {rate >= 100 ? rate.toFixed(2) : rate.toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
