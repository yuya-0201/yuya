import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTrades, updateTradeAnalysis } from "@/lib/trades";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  const trades = await getTrades();
  const trade = id ? trades.find((t) => t.id === id) : null;

  if (id && !trade) {
    return NextResponse.json({ error: "トレードが見つかりません" }, { status: 404 });
  }

  const targetTrades = trade ? [trade] : trades;
  if (targetTrades.length === 0) {
    return NextResponse.json({ error: "分析するトレードがありません" }, { status: 400 });
  }

  const tradesText = targetTrades
    .map((t, i) => {
      const pnl = t.direction === "buy"
        ? (t.exitRate - t.entryRate) * t.lotSize
        : (t.entryRate - t.exitRate) * t.lotSize;
      return `【トレード${i + 1}】${t.baseCurrency}/${t.targetCurrency} ${t.direction === "buy" ? "買い" : "売り"}
エントリー: ${t.entryRate} → エグジット: ${t.exitRate} / ロット: ${t.lotSize}
損益: ${pnl >= 0 ? "+" : ""}${pnl.toFixed(4)}
良かった点: ${t.goodPoints || "なし"}
反省点: ${t.reflections || "なし"}`;
    })
    .join("\n\n");

  const prompt = trade
    ? `以下のFXトレードを分析してください。良かった点・反省点を踏まえ、次回への改善アドバイスを具体的に提供してください。\n\n${tradesText}`
    : `以下の${trades.length}件のFXトレード記録を総合分析してください。パターン、傾向、改善点を日本語で詳しく教えてください。\n\n${tradesText}`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  const analysisText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");

  if (trade) {
    await updateTradeAnalysis(trade.id, analysisText);
  }

  return NextResponse.json({ analysis: analysisText });
}
