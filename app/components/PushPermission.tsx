"use client";

import { useState, useEffect } from "react";

export default function PushPermission() {
  const [status, setStatus] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) { setStatus("unsupported"); return; }
    setStatus(Notification.permission);
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission);
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "unsupported") return null;

  if (status === "granted") {
    return (
      <div className="flex items-center gap-2 bg-green-950 border border-green-800 rounded-xl px-4 py-3 text-sm text-green-400">
        <span>✓</span>
        <span>プッシュ通知が有効です</span>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
    >
      <span>🔔</span>
      <span>{loading ? "設定中..." : "プッシュ通知を有効にする"}</span>
    </button>
  );
}
