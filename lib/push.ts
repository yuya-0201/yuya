import webpush from "web-push";
import { kv } from "@vercel/kv";

const SUBSCRIPTIONS_KEY = "push_subscriptions";

webpush.setVapidDetails(
  "mailto:fx-alert@app.local",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function getSubscriptions(): Promise<PushSubscription[]> {
  return (await kv.get<PushSubscription[]>(SUBSCRIPTIONS_KEY)) ?? [];
}

export async function saveSubscription(sub: PushSubscription): Promise<void> {
  const subs = await getSubscriptions();
  if (!subs.find((s) => s.endpoint === sub.endpoint)) {
    subs.push(sub);
    await kv.set(SUBSCRIPTIONS_KEY, subs);
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const subs = await getSubscriptions();
  await kv.set(SUBSCRIPTIONS_KEY, subs.filter((s) => s.endpoint !== endpoint));
}

export async function sendPushNotification(title: string, body: string): Promise<void> {
  const subs = await getSubscriptions();
  const payload = JSON.stringify({ title, body });
  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(sub, payload).catch(async (err) => {
        if (err.statusCode === 410) await removeSubscription(sub.endpoint);
      })
    )
  );
}
