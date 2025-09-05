const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5233";

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
		cache: "no-store",
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Request failed ${res.status}: ${text}`);
	}
	return res.json();
}

