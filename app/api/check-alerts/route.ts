import { NextResponse } from "next/server";
import { readAlerts, updateAlert } from "@/lib/alerts";
import { getRate, getHistoricalRates } from "@/lib/fx";
import { sendLineNotification } from "@/lib/line";
import { calcBollingerBands, calcSMA, calcRSI } from "@/lib/technicals";
import { TechnicalType } from "@/lib/types";

async function checkTechnical(
  base: string, target: string, type: TechnicalType
): Promise<{ triggered: boolean; message: string }> {
  const sigma = type.includes("_1") ? 1 : type.includes("_2") ? 2 : 3;
  const currentRate = await getRate(base, target);

  if (type.startsWith("bb_")) {
    const prices = await getHistoricalRates(base, target, 20);
    const bb = calcBollingerBands(prices, 20, sigma);
    if (!bb) return { triggered: false, message: "" };
    const isUpper = type.startsWith("bb_upper");
    const triggered = isUpper ? currentRate >= bb.upper : currentRate <= bb.lower;
    const band = isUpper ? bb.upper : bb.lower;
    return {
      triggered,
      message: `\n【テクニカルアラート】\n${base}/${target} がボリンジャーバンド${sigma}σ${isUpper ? "上限" : "下限"}に到達\n現在: ${currentRate.toFixed(4)} / バンド: ${band.toFixed(4)}`,
    };
  }

  if (type.startsWith("sma")) {
    const period = type.startsWith("sma5") ? 5 : type.startsWith("sma20") ? 20 : 75;
    const prices = await getHistoricalRates(base, target, period + 1);
    const sma = calcSMA(prices, period);
    if (!sma) return { triggered: false, message: "" };
    const isAbove = type.endsWith("above");
    const triggered = isAbove ? currentRate >= sma : currentRate <= sma;
    return {
      triggered,
      message: `\n【テクニカルアラート】\n${base}/${target} が${period}日SMAを${isAbove ? "上抜け" : "下抜け"}\n現在: ${currentRate.toFixed(4)} / SMA${period}: ${sma.toFixed(4)}`,
    };
  }

  if (type.startsWith("rsi")) {
    const prices = await getHistoricalRates(base, target, 30);
    const rsi = calcRSI(prices, 14);
    if (!rsi) return { triggered: false, message: "" };
    const level = type.includes("70") ? 70 : type.includes("80") ? 80 : type.includes("30") ? 30 : 20;
    const isAbove = type.includes("above");
    const triggered = isAbove ? rsi >= level : rsi <= level;
    return {
      triggered,
      message: `\n【テクニカルアラート】\n${base}/${target} のRSIが${level}を${isAbove ? "上回り" : "下回り"}ました\nRSI: ${rsi.toFixed(1)}`,
    };
  }

  return { triggered: false, message: "" };
}

export async function POST() {
  const alerts = (await readAlerts()).filter((a) => a.active);
  const results: { id: string; triggered: boolean; error?: string }[] = [];

  for (const alert of alerts) {
    try {
      let triggered = false;
      let message = "";

      if (alert.mode === "technical" && alert.technicalType) {
        const result = await checkTechnical(alert.baseCurrency, alert.targetCurrency, alert.technicalType);
        triggered = result.triggered;
        message = result.message;
      } else {
        const rate = await getRate(alert.baseCurrency, alert.targetCurrency);
        triggered = alert.condition === "above" ? rate >= (alert.threshold ?? 0) : rate <= (alert.threshold ?? 0);
        if (triggered) {
          const direction = alert.condition === "above" ? "以上" : "以下";
          message = `\n【FXアラート】\n${alert.baseCurrency}/${alert.targetCurrency} が ${alert.threshold} ${direction} になりました\n現在レート: ${rate.toFixed(4)}`;
        }
      }

      if (triggered && message) {
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
