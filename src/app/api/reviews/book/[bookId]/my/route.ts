import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
	process.env.API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	"http://localhost:5233";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ bookId: string }> }
) {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
		}

		const { bookId } = await params;
		const res = await fetch(`${BASE_URL}/api/Reviews/book/${bookId}/my`, {
			method: "GET",
			headers: {
				"Authorization": authHeader,
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			if (res.status === 404) {
				return NextResponse.json(null, { status: 404 });
			}
			const text = await res.text();
			return NextResponse.json({ error: text || "Upstream error" }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Fetch failed";
		return NextResponse.json({ error: message }, { status: 502 });
	}
}

