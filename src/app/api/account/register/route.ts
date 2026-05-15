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
  console.log('Registration API - Received body:', body);
  const errors: Array<{ url: string; error: string }> = [];
  
  for (const base of CANDIDATES) {
    const url = `${base}/api/Account/register`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10 seconds
      
      console.log('Registration API - Sending to backend:', url, body);
      
      const res = await fetch(url, { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), 
        signal: controller.signal 
      });
      
      clearTimeout(timeout);
      
      console.log('Registration API - Backend response:', res.status, res.statusText);
      
      if (!res.ok) {
        const text = await res.text();
        console.log('Registration API - Backend error response:', text);
        let message = "Registration failed";
        let details: unknown = text;

        try {
          details = JSON.parse(text);

          if (Array.isArray(details)) {
            const descriptions = details
              .map((item) => item?.description || item?.Description || item?.message || item?.Message)
              .filter(Boolean);
            if (descriptions.length > 0) {
              message = descriptions.join(" ");
            }
          } else if (details && typeof details === "object") {
            const data = details as { message?: string; Message?: string; error?: string; Error?: string };
            message = data.message || data.Message || data.error || data.Error || message;
          }
        } catch {
          message = text || message;
        }

        return NextResponse.json({ error: "Registration failed", message, details }, { status: res.status });
      }
      
      const responseData = await res.text();
      console.log('Registration API - Backend success response:', responseData);
      
      return new NextResponse(null, { status: 200 });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.log('Registration API - Request error:', errorMessage);
      errors.push({ url, error: errorMessage });
    }
  }
  
  console.error("All backend attempts failed:", errors);
  return NextResponse.json({ 
    error: "Backend unreachable", 
    message: "Unable to connect to the backend server. Please ensure the backend is running.",
    tried: errors 
  }, { status: 502 });
}

