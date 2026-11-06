import { NextResponse } from "next/server";
import { notify, integrations, type NotifyInput } from "@/lib/notify";

// GET: which chat integrations are configured. POST: send one message or alert.
export async function GET() {
  return NextResponse.json(integrations());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as NotifyInput | null;
  if (!body?.title || !body.text || !["message", "alert"].includes(body.kind)) {
    return NextResponse.json({ error: "Need kind, title and text" }, { status: 400 });
  }
  return NextResponse.json(await notify(body));
}
