"use client";

import { useState } from "react";
import { POPULAR_CURRENCIES } from "@/lib/fx";
import { AlertMode, TechnicalType } from "@/lib/types";

const TECHNICAL_OPTIONS: { value: TechnicalType; label: string }[] = [
  { value: "bb_upper_1", label: "BB 上限 1σ タッチ" },
  { value: "bb_upper_2", label: "BB 上限 2σ タッチ" },
  { value: "bb_upper_3", label: "BB 上限 3σ タッチ" },
  { value: "bb_lower_1", label: "BB 下限 1σ タッチ" },
  { value: "bb_lower_2", label: "BB 下限 2σ タッチ" },
  { value: "bb_lower_3", label: "BB 下限 3σ タッチ" },
  { value: "sma5_above",  label: "5日SMA 上抜け" },
  { value: "sma5_below",  label: "5日SMA 下抜け" },
  { value: "sma20_above", label: "20日SMA 上抜け" },
  { value: "sma20_below", label: "20日SMA 下抜け" },
  { value: "sma75_above", label: "75日SMA 上抜け" },
  { value: "sma75_below", label: "75日SMA 下抜け" },
  { value: "rsi_above_70", label: "RSI 70以上（買われすぎ）" },
  { value: "rsi_above_80", label: "RSI 80以上（強い買われすぎ）" },
  { value: "rsi_below_30", label: "RSI 30以下（売られすぎ）" },
  { value: "rsi_below_20", label: "RSI 20以下（強い売られすぎ）" },
];

interface Props {
  onAdded: () => void;
}

export default function AlertForm({ onAdded }: Props) {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("JPY");
  const [mode, setMode] = useState<AlertMode>("price");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState("");
  const [technicalType, setTechnicalType] = useState<TechnicalType>("bb_upper_2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (mode === "price" && !threshold) { setError("レートを入力してください"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseCurrency, targetCurrency, mode, condition, threshold, technicalType }),
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
        <label className="block text-xs text-gray-400 mb-1">アラートタイプ</label>
        <div className="flex gap-2">
          {(["price", "technical"] as AlertMode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"
              }`}>
              {m === "price" ? "価格指定" : "テクニカル"}
            </button>
          ))}
        </div>
      </div>

      {mode === "price" ? (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">条件</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value as "above" | "below")}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
              <option value="above">以上になったら通知</option>
              <option value="below">以下になったら通知</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">レート ({baseCurrency}/{targetCurrency})</label>
            <input type="number" step="any" value={threshold} onChange={(e) => setThreshold(e.target.value)}
              placeholder="例: 155.00"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-xs text-gray-400 mb-1">テクニカル条件</label>
          <select value={technicalType} onChange={(e) => setTechnicalType(e.target.value as TechnicalType)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
            <optgroup label="ボリンジャーバンド">
              {TECHNICAL_OPTIONS.filter(o => o.value.startsWith("bb_")).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
            <optgroup label="移動平均線 (SMA)">
              {TECHNICAL_OPTIONS.filter(o => o.value.startsWith("sma")).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
            <optgroup label="RSI">
              {TECHNICAL_OPTIONS.filter(o => o.value.startsWith("rsi")).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">アラートを登録しました</p>}

      <button type="submit" disabled={loading}
        className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg font-medium transition-colors">
        {loading ? "登録中..." : "アラートを登録"}
      </button>
    </form>
  );
}
