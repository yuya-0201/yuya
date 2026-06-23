import { NextRequest, NextResponse } from "next/server";
import { sendLineNotification } from "@/lib/line";

export async function POST(req: NextRequest) {
  const { token, message } = await req.json();
  if (!token || !message) {
    return NextResponse.json({ error: "Missing token or message" }, { status: 400 });
  }
  try {
    await sendLineNotification(token, message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
