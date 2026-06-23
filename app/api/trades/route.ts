import { NextRequest, NextResponse } from "next/server";
import { getTrades, addTrade, deleteTrade } from "@/lib/trades";

export async function GET() {
  return NextResponse.json(getTrades());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { baseCurrency, targetCurrency, direction, entryRate, exitRate, lotSize, goodPoints, reflections } = body;

  if (!baseCurrency || !targetCurrency || !direction || entryRate == null || exitRate == null) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const trade = addTrade({
    baseCurrency,
    targetCurrency,
    direction,
    entryRate: parseFloat(entryRate),
    exitRate: parseFloat(exitRate),
    lotSize: parseFloat(lotSize ?? 1),
    goodPoints: goodPoints ?? "",
    reflections: reflections ?? "",
  });

  return NextResponse.json(trade);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "idが必要です" }, { status: 400 });
  deleteTrade(id);
  return NextResponse.json({ ok: true });
}
