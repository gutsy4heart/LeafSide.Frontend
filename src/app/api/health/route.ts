import { NextResponse } from "next/server";

const ENV_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

const CANDIDATES = [
  ENV_BASE,
  "http://localhost:5233",
  "http://127.0.0.1:5233",
  "https://localhost:7091",
].filter(Boolean);

export async function GET() {
  const results: Array<{ url: string; ok: boolean; status?: number; error?: string }> = [];
  for (const base of CANDIDATES) {
    const url = `${base}/swagger`;
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(3000) });
      results.push({ url: base, ok: res.ok, status: res.status });
      if (res.ok) {
        return NextResponse.json({ ok: true, selectedBase: base, tried: results });
      }
    } catch (e: unknown) {
      results.push({ url: base, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ ok: false, selectedBase: null, tried: results }, { status: 502 });
}


