// Chat integrations: posts approved messages and organizer alerts to Discord and/or Slack
// via incoming webhooks. With no webhook configured, it reports "simulated" so the demo
// still works offline.
//
// .env.local:
//   DISCORD_WEBHOOK_URL=             participant-facing channel (e.g. #pod-14)
//   DISCORD_ORGANIZER_WEBHOOK_URL=   optional private #organizers channel (falls back to the one above)
//   SLACK_WEBHOOK_URL=               optional, same messages to Slack

export type NotifyKind = "message" | "alert";

export type NotifyInput = {
  kind: NotifyKind;
  title: string;
  text: string;
  fields?: { name: string; value: string }[];
};

export type NotifyResult = { delivered: string[]; simulated: boolean; errors: string[] };

const COLORS = { message: 0x5b3fd6, alert: 0xd9472b };

export function integrations() {
  return {
    discord: Boolean(process.env.DISCORD_WEBHOOK_URL),
    discordOrganizers: Boolean(process.env.DISCORD_ORGANIZER_WEBHOOK_URL),
    slack: Boolean(process.env.SLACK_WEBHOOK_URL),
  };
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

async function postDiscord(url: string, n: NotifyInput) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Momentum",
      allowed_mentions: { parse: [] }, // never ping @everyone or users from generated text
      embeds: [
        {
          title: clip(n.title, 250),
          description: clip(n.text, 3900),
          color: COLORS[n.kind],
          fields: (n.fields ?? []).slice(0, 10).map((f) => ({ name: clip(f.name, 250), value: clip(f.value || "—", 1000), inline: true })),
          footer: { text: n.kind === "alert" ? "Momentum · organizer alert" : "Momentum · approved by an organizer" },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Discord ${res.status}`);
}

async function postSlack(url: string, n: NotifyInput) {
  const fields = (n.fields ?? []).map((f) => `*${f.name}:* ${f.value}`).join("   ");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `${n.kind === "alert" ? "⚑ " : ""}${n.title}`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: clip(`${n.kind === "alert" ? "⚑ " : ""}${n.title}`, 150) } },
        { type: "section", text: { type: "mrkdwn", text: clip(n.text, 2900) } },
        ...(fields ? [{ type: "context", elements: [{ type: "mrkdwn", text: clip(fields, 2900) }] }] : []),
      ],
    }),
  });
  if (!res.ok) throw new Error(`Slack ${res.status}`);
}

export async function notify(n: NotifyInput): Promise<NotifyResult> {
  const discordUrl = n.kind === "alert" ? process.env.DISCORD_ORGANIZER_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL : process.env.DISCORD_WEBHOOK_URL;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const targets: [string, () => Promise<void>][] = [];
  if (discordUrl) targets.push(["Discord", () => postDiscord(discordUrl, n)]);
  if (slackUrl) targets.push(["Slack", () => postSlack(slackUrl, n)]);
  if (!targets.length) return { delivered: [], simulated: true, errors: [] };

  const results = await Promise.allSettled(targets.map(([, f]) => f()));
  return {
    delivered: targets.filter((_, i) => results[i].status === "fulfilled").map(([name]) => name),
    simulated: false,
    errors: results.flatMap((r) => (r.status === "rejected" ? [String((r.reason as Error).message)] : [])),
  };
}
