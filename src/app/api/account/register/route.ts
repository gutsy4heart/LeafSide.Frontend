import { NextResponse } from "next/server";

const ENV_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";

const CANDIDATES = [
  ENV_BASE,
  "http://localhost:5233",
  "http://127.0.0.1:5233",
  "https://localhost:7091",
].filter(Boolean);

export async function POST(req: Request) {
  const form = await req.formData();
  const errors: Array<{ url: string; error: string }> = [];
  for (const base of CANDIDATES) {
    const url = `${base}/api/Account/register`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { method: "POST", body: form, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        const text = await res.text();
        errors.push({ url, error: `${res.status} ${text}` });
        continue;
      }
      return new NextResponse(null, { status: 200 });
    } catch (e: unknown) {
      errors.push({ url, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ error: "Backend unreachable", tried: errors }, { status: 502 });
}


