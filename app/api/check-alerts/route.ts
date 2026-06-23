import { NextResponse } from "next/server";
import { readAlerts, updateAlert } from "@/lib/alerts";
import { getRate } from "@/lib/fx";
import { sendLineNotification } from "@/lib/line";

export async function POST() {
  const alerts = (await readAlerts()).filter((a) => a.active);
  const results: { id: string; triggered: boolean; error?: string }[] = [];

  for (const alert of alerts) {
    try {
      const rate = await getRate(alert.baseCurrency, alert.targetCurrency);
      const triggered =
        alert.condition === "above" ? rate >= alert.threshold : rate <= alert.threshold;

      if (triggered) {
        const direction = alert.condition === "above" ? "以上" : "以下";
        const message =
          `\n【FXアラート】\n` +
          `${alert.baseCurrency}/${alert.targetCurrency} が ${alert.threshold} ${direction} になりました\n` +
          `現在レート: ${rate.toFixed(4)}`;
        await sendLineNotification(alert.lineToken, message);
        await updateAlert(alert.id, { lastTriggeredAt: new Date().toISOString() });
      }

      results.push({ id: alert.id, triggered });
    } catch (e) {
      results.push({ id: alert.id, triggered: false, error: String(e) });
    }
  }

  return NextResponse.json({ checked: results.length, results });
}
