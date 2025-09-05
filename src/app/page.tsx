import Image from "next/image";
import { fetchJson } from "../lib/api";
import type { Book } from "../types/book";
export default async function Home() {
  // Use internal Next API route to avoid network issues
  const books = await fetchJson<Book[]>("/api/books");
  return (
    <div className="font-sans min-h-screen p-8 sm:p-12">
      <header className="mb-8 flex items-center gap-3">
        <Image className="dark:invert" src="/next.svg" alt="Logo" width={40} height={40} />
        <h1 className="text-2xl font-semibold">LeafSide — Книги</h1>
      </header>
      <main className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {books.map((b) => (
          <article key={b.id} className="rounded-lg border p-4 bg-white/50 dark:bg-black/20">
            <div className="aspect-[3/4] mb-3 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <h2 className="font-medium line-clamp-2">{b.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{b.author}</p>
            {b.price != null && (
              <p className="mt-1 font-semibold">{b.price.toFixed(2)} ₸</p>
            )}
          </article>
        ))}
      </main>
    </div>
  );
}
