import { NextRequest, NextResponse } from "next/server";
import { getLatestRates } from "@/lib/fx";

export async function GET(req: NextRequest) {
  const base = req.nextUrl.searchParams.get("base") ?? "USD";
  try {
    const data = await getLatestRates(base);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
