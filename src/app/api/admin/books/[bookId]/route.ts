import { NextRequest, NextResponse } from "next/server";

function mapToAdminBook(b: any) {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    description: b.description ?? "",
    isbn: b.isbn ?? "",
    publishedYear: Number(b.publishing ?? b.publishedYear ?? new Date().getFullYear()),
    genre: b.genre ?? "Other",
    language: b.language ?? "Russian",
    pageCount: Number(b.pageCount ?? 0),
    price: Number(b.price ?? 0),
    coverImageUrl: b.imageUrl ?? b.coverImageUrl ?? "",
    isAvailable: b.isAvailable ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Токен не предоставлен' }, { status: 401 });
    }

    const { bookId } = params;
    const body = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: 'ID книги не указан' }, { status: 400 });
    }

    // Convert to form-data to update catalog book (always send all fields)
    const form = new FormData();
    const toPrice = (v: unknown) => {
      const s = String(v ?? 0);
      return s.includes(',') ? s : s.replace('.', ',');
    };
    const set = (k: string, v: unknown) => form.set(k, v != null ? String(v) : "");
    set("Title", body.title);
    set("Description", body.description);
    set("Author", body.author);
    set("Genre", body.genre);
    set("Publishing", body.publishedYear);
    set("Created", body.publishedYear);
    set("ImageUrl", body.coverImageUrl ?? "https://via.placeholder.com/300x450?text=LeafSide");
    form.set("Price", toPrice(body.price));
    set("Isbn", body.isbn);
    set("Language", body.language);
    set("PageCount", body.pageCount);
    set("IsAvailable", body.isAvailable);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5233';
    const response = await fetch(`${backendUrl}/api/Books/${bookId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
      }
      if (response.status === 403) {
        return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: 'Книга не найдена' }, { status: 404 });
      }
      if (response.status === 400) {
        const errorData = await response.json();
        return NextResponse.json({ error: errorData.error || 'Ошибка валидации' }, { status: 400 });
      }

      const errorText = await response.text();
      return NextResponse.json({ error: `Ошибка сервера: ${errorText}` }, { status: response.status });
    }

    const book = await response.json();
    return NextResponse.json(mapToAdminBook(book));
  } catch (error) {
    console.error('Ошибка при обновлении книги:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Токен не предоставлен' }, { status: 401 });
    }

    const { bookId } = params;

    if (!bookId) {
      return NextResponse.json({ error: 'ID книги не указан' }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5233';
    const response = await fetch(`${backendUrl}/api/Books/${bookId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
      }
      if (response.status === 403) {
        return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: 'Книга не найдена' }, { status: 404 });
      }

      const errorText = await response.text();
      return NextResponse.json({ error: `Ошибка сервера: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при удалении книги:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
