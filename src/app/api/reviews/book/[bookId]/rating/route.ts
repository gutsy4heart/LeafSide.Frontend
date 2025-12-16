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
		const { bookId } = await params;
		const res = await fetch(`${BASE_URL}/api/Reviews/book/${bookId}/rating`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
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

