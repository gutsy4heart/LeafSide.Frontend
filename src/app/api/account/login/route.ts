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

console.log("Environment variables:");
console.log("API_BASE_URL:", process.env.API_BASE_URL);
console.log("NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
console.log("ENV_BASE:", ENV_BASE);
console.log("CANDIDATES:", CANDIDATES);

export async function POST(req: Request) {
  const form = await req.formData();
  const errors: Array<{ url: string; error: string }> = [];
  
  console.log("=== LOGIN API ROUTE DEBUG ===");
  console.log("Attempting to connect to backend...");
  console.log("Available candidates:", CANDIDATES);
  console.log("Form data:", Object.fromEntries(form.entries()));
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  
  for (const base of CANDIDATES) {
    const url = `${base}/api/Account/login`;
    console.log(`Trying to connect to: ${url}`);
    
    try {
      // First, try to check if the backend is alive with a simple GET request
      try {
        const healthCheckUrl = `${base}/swagger`;
        console.log(`Health check: ${healthCheckUrl}`);
        const healthResponse = await fetch(healthCheckUrl, { 
          method: "GET",
          signal: AbortSignal.timeout(3000)
        });
        console.log(`Health check response: ${healthResponse.status}`);
      } catch (healthError) {
        console.log(`Health check failed: ${healthError}`);
      }
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      
      const res = await fetch(url, { 
        method: "POST", 
        body: form, 
        signal: controller.signal
        // Не указываем Content-Type, чтобы браузер сам установил правильный заголовок для FormData
      });
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        const text = await res.text();
        console.log(`Backend responded with ${res.status}: ${text}`);
        errors.push({ url, error: `${res.status} ${text}` });
        continue;
      }
      
      const data = await res.json();
      console.log("Successfully connected to backend and received response");
      return NextResponse.json(data);
      
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.log(`Connection failed to ${url}: ${errorMessage}`);
      errors.push({ url, error: errorMessage });
    }
  }
  
  console.error("All backend connection attempts failed:", errors);
  return NextResponse.json({ 
    error: "Сервер недоступен. Проверьте, что бэкенд запущен на порту 5233.", 
    details: "Попробуйте запустить бэкенд командой: cd LeafSide-backend && dotnet run --project LeafSide.API",
    tried: errors 
  }, { status: 502 });
}


