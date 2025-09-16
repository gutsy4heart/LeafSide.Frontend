import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
	process.env.API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	"http://localhost:5233";

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
		}

		const body = await request.json();
		
		const res = await fetch(`${BASE_URL}/api/Cart/items`, {
			method: "POST",
			headers: {
				"Authorization": authHeader,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});


		if (!res.ok) {
			let errorMessage = "Upstream error";
			try {
				const text = await res.text();
				console.error('Cart API - Error response text:', text);
				
				// Пытаемся распарсить как JSON
				try {
					const errorJson = JSON.parse(text);
					errorMessage = errorJson.error || errorJson.message || text || errorMessage;
					console.error('Cart API - Parsed error JSON:', errorJson);
				} catch (jsonError) {
					// Если не JSON, используем текст как есть
					errorMessage = text || errorMessage;
					console.error('Cart API - Error is not JSON, using text:', errorMessage);
				}
			} catch (textError) {
				console.error('Cart API - Failed to get error text:', textError);
				errorMessage = `HTTP ${res.status}: ${res.statusText}`;
			}
			
			return NextResponse.json({ error: errorMessage }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Fetch failed";
		console.error('Cart API - Exception:', message);
		return NextResponse.json({ error: message }, { status: 502 });
	}
}
