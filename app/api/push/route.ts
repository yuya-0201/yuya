import { NextRequest, NextResponse } from "next/server";
import { saveSubscription, removeSubscription } from "@/lib/push";

export async function POST(req: NextRequest) {
  const sub = await req.json();
  await saveSubscription(sub);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  await removeSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
