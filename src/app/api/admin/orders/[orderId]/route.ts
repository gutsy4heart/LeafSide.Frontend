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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await readBackendError(response, 'Failed to fetch order');
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    console.log('API route /api/admin/orders/[orderId] PUT вызван для orderId:', orderId);
    
    if (!token) {
      console.log('Токен не предоставлен');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Тело запроса:', body);

    console.log('Отправляем запрос на бэкенд:', `${BACKEND_URL}/api/admin/orders/${orderId}/status`);

    const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Ответ бэкенда:', response.status, response.statusText);
    console.log('Content-Type бэкенда:', response.headers.get('content-type'));

    if (!response.ok) {
      const error = await readBackendError(response, 'Failed to update order');
      console.error('Ошибка бэкенда:', error);
      return NextResponse.json({ error }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Получены данные от бэкенда:', data);
      return NextResponse.json(data);
    } else {
      const text = await response.text();
      console.error('Бэкенд вернул не JSON:', text.substring(0, 200));
      return NextResponse.json({ error: 'Бэкенд вернул неожиданный формат данных' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await readBackendError(response, 'Failed to delete order');
      return NextResponse.json({ error }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
