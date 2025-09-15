import Image from "next/image";
import { fetchJson } from "../lib/api";
import type { Book } from "../types/book";
import BookCard from "./components/BookCard";
export default async function Home() {
  // Use internal Next API route to avoid network issues
  const books = await fetchJson<Book[]>("/api/books");
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl card">
        <div className="absolute inset-0 opacity-40" style={{
          background: "radial-gradient(1200px 400px at 10% -10%, rgba(52,211,153,0.25), transparent), radial-gradient(800px 400px at 90% -20%, rgba(59,130,246,0.18), transparent)"
        }} />
        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight">Найдите свою следующую книгу</h1>
            <p className="mt-3 text-[var(--muted)]">Каталог тщательно отобранных изданий: от художественной литературы до нон‑фикшн.</p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#catalog" className="btn-accent">Смотреть каталог</a>
              <a href="#" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Узнать больше</a>
            </div>
          </div>
        </div>
      </section>

      <main id="catalog" className="grid gap-6 sm:gap-7 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </main>
    </div>
  );
}
