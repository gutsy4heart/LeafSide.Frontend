import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Токен не предоставлен' }, { status: 401 });
    }

    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json({ error: 'ID пользователя не указан' }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5233';
    const response = await fetch(`${backendUrl}/api/Account/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
      }
      if (response.status === 403) {
        return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
      }
      
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData.error || 'Ошибка сервера' 
      }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
