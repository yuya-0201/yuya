import { NextRequest, NextResponse } from "next/server";
import { readAlerts, addAlert, deleteAlert } from "@/lib/alerts";

export async function GET() {
  return NextResponse.json(await readAlerts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { baseCurrency, targetCurrency, mode, condition, threshold, technicalType } = body;

  if (!baseCurrency || !targetCurrency || !mode) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }
  if (mode === "price" && (condition == null || threshold == null)) {
    return NextResponse.json({ error: "価格アラートには条件とレートが必要です" }, { status: 400 });
  }
  if (mode === "technical" && !technicalType) {
    return NextResponse.json({ error: "テクニカル条件を選択してください" }, { status: 400 });
  }

  const alert = await addAlert({
    baseCurrency, targetCurrency, mode,
    condition: mode === "price" ? condition : undefined,
    threshold: mode === "price" ? parseFloat(threshold) : undefined,
    technicalType: mode === "technical" ? technicalType : undefined,
    active: true,
  });
  return NextResponse.json(alert, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const deleted = await deleteAlert(id);
  if (!deleted) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
