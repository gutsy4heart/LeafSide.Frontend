import { NextRequest, NextResponse } from "next/server";

// Map backend catalog book to admin book shape
function mapToAdminBook(b: any) {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    description: b.description ?? "",
    isbn: b.isbn ?? "",
    publishedYear: Number(new Date().getFullYear()),
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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5233";
    const res = await fetch(`${backendUrl}/api/Books`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Ошибка сервера: ${text}` }, { status: res.status });
    }

    const books = await res.json();
    return NextResponse.json(Array.isArray(books) ? books.map(mapToAdminBook) : []);
  } catch (error) {
    console.error("Ошибка при получении книг:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 });
    }

    const body = await request.json();

    // Convert to form-data expected by backend BooksController ([FromForm])
    const form = new FormData();
    form.set("Title", body.title ?? "");
    form.set("Description", body.description ?? "");
    form.set("Author", body.author ?? "");
    form.set("Genre", body.genre ?? "Other");
    form.set("Publishing", String(body.publishedYear ?? ""));
    form.set("Created", String(body.publishedYear ?? new Date().getFullYear()));
    form.set("ImageUrl", body.coverImageUrl ?? "");
    form.set("Price", String(body.price ?? 0));

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5233";
    const res = await fetch(`${backendUrl}/api/Books`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Ошибка сервера: ${text}` }, { status: res.status });
    }

    const created = await res.json();
    return NextResponse.json(mapToAdminBook(created));
  } catch (error) {
    console.error("Ошибка при создании книги:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
