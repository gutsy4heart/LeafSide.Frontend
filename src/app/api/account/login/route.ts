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
  const body = await req.json();
  const errors: Array<{ url: string; error: string }> = [];
  
  for (const base of CANDIDATES) {
    const url = `${base}/api/Account/login`;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      
      const res = await fetch(url, { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), 
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        const text = await res.text();
        let message = res.status === 401 ? "Invalid email or password" : "Login failed";
        let details: unknown = text;

        try {
          details = JSON.parse(text);

          if (details && typeof details === "object") {
            const data = details as { message?: string; Message?: string; error?: string; Error?: string };
            message = data.message || data.Message || data.error || data.Error || message;
          }
        } catch {
          message = text || message;
        }

        return NextResponse.json({ error: "Login failed", message, details }, { status: res.status });
      }
      
      const data = await res.json();
      return NextResponse.json(data);
      
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      errors.push({ url, error: errorMessage });
    }
  }
  
  return NextResponse.json({ 
    error: "Сервер недоступен. Проверьте, что бэкенд запущен на порту 5233.", 
    details: "Попробуйте запустить бэкенд командой: cd LeafSide-backend && dotnet run --project LeafSide.API",
    tried: errors 
  }, { status: 502 });
}

