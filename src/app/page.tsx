import Image from "next/image";
import { fetchJson } from "../lib/api";
import type { Book } from "../types/book";
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
        {books.map((b) => (
          <a 
            key={b.id} 
            href={`/books/${b.id}`} 
            className="card p-4 block hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 group"
          >
            <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-[var(--card)] relative">
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={b.imageUrl} 
                  alt={b.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Нет изображения</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </div>
            <h2 className="font-medium leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {b.title}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">{b.author}</p>
            {b.price != null && (
              <p className="mt-2 font-semibold text-green-600">
                {b.price.toFixed(2)} ₸
              </p>
            )}
            <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Нажмите для подробностей →
            </div>
          </a>
        ))}
      </main>
    </div>
  );
}
