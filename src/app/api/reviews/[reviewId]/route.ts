import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
	process.env.API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	"http://localhost:5233";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ reviewId: string }> }
) {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
		}

		const { reviewId } = await params;
		const body = await request.json();

		const res = await fetch(`${BASE_URL}/api/Reviews/${reviewId}`, {
			method: "PUT",
			headers: {
				"Authorization": authHeader,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ reviewId: string }> }
) {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
		}

		const { reviewId } = await params;

		const res = await fetch(`${BASE_URL}/api/Reviews/${reviewId}`, {
			method: "DELETE",
			headers: {
				"Authorization": authHeader,
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			const text = await res.text();
			return NextResponse.json({ error: text || "Upstream error" }, { status: res.status });
		}

		return new NextResponse(null, { status: 204 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Fetch failed";
		return NextResponse.json({ error: message }, { status: 502 });
	}
}

