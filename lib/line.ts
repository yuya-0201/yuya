export async function sendLineNotification(token: string, message: string): Promise<void> {
  const res = await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams({ message }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE Notify error: ${res.status} ${body}`);
  }
}
