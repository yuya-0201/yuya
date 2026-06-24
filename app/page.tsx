"use client";

import { useState, useEffect, useCallback } from "react";
import { Alert } from "@/lib/types";
import Link from "next/link";
import AlertForm from "./components/AlertForm";
import AlertList from "./components/AlertList";
import RateDisplay from "./components/RateDisplay";
import PushPermission from "./components/PushPermission";

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const fetchAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts");
    const data = await res.json();
    setAlerts(data);
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleCheckAlerts = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch("/api/check-alerts", { method: "POST" });
      const data = await res.json();
      const triggered = data.results.filter((r: { triggered: boolean }) => r.triggered).length;
      setCheckResult(`${data.checked}件確認、${triggered}件の通知を送信しました`);
      fetchAlerts();
    } catch {
      setCheckResult("チェック中にエラーが発生しました");
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-green-400">FX通知アプリ</h1>
          <p className="text-gray-400 mt-1">為替レートが条件を満たしたらプッシュ通知</p>
          <Link href="/journal" className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            トレード日誌・AI分析 →
          </Link>
        </header>

        <div className="mb-6">
          <PushPermission />
        </div>

        <RateDisplay />

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-green-300">アラートを追加</h2>
            <AlertForm onAdded={fetchAlerts} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-green-300">登録済みアラート</h2>
              <button
                onClick={handleCheckAlerts}
                disabled={checking || alerts.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                {checking ? "確認中..." : "今すぐチェック"}
              </button>
            </div>
            {checkResult && (
              <p className="text-sm text-green-400 mb-3 bg-green-950 px-3 py-2 rounded">{checkResult}</p>
            )}
            <AlertList alerts={alerts} onDeleted={fetchAlerts} />
          </section>
        </div>
      </div>
    </main>
  );
}
