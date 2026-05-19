import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5233';

async function readBackendError(response: Response, fallback: string) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const errorData = await response.json().catch(() => ({}));
    return errorData.error || errorData.message || fallback;
  }

  const text = await response.text().catch(() => '');
  return text || `${fallback}: ${response.status} ${response.statusText}`;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await readBackendError(response, 'Failed to fetch orders');
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
