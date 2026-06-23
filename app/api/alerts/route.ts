import { NextRequest, NextResponse } from "next/server";
import { readAlerts, addAlert, deleteAlert } from "@/lib/alerts";

export async function GET() {
  return NextResponse.json(readAlerts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { baseCurrency, targetCurrency, condition, threshold, lineToken } = body;

  if (!baseCurrency || !targetCurrency || !condition || threshold == null || !lineToken) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const alert = addAlert({ baseCurrency, targetCurrency, condition, threshold, lineToken, active: true });
  return NextResponse.json(alert, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const deleted = deleteAlert(id);
  if (!deleted) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
