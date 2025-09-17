import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
	process.env.API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	"http://localhost:5233";

export async function GET(request: NextRequest) {
	try {
		console.log('Stats API - Request received');
		const authHeader = request.headers.get("authorization");
		console.log('Stats API - Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'null');
		
		if (!authHeader) {
			console.log('Stats API - No authorization header');
			return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
		}

		console.log('Stats API - Calling backend:', `${BASE_URL}/api/UserStats/stats`);
		const res = await fetch(`${BASE_URL}/api/UserStats/stats`, {
			method: "GET",
			headers: {
				"Authorization": authHeader,
				"Content-Type": "application/json",
			},
		});

		console.log('Stats API - Backend response status:', res.status);
		if (!res.ok) {
			const text = await res.text();
			console.log('Stats API - Backend error:', text);
			return NextResponse.json({ error: text || "Upstream error" }, { status: res.status });
		}

		const data = await res.json();
		console.log('Stats API - Backend data:', data);
		return NextResponse.json(data);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Fetch failed";
		console.log('Stats API - Error:', message);
		return NextResponse.json({ error: message }, { status: 502 });
	}
}