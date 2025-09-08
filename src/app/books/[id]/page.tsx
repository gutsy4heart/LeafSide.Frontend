import type { Book } from "@/src/types/book";
import { fetchJson } from "@/src/lib/api";
import Image from "next/image";
import { useCart } from "@/src/app/cart-context";
import { Suspense } from "react";

type Props = { params: { id: string } };

export default async function BookDetails({ params }: Props) {
  const book = await fetchJson<Book>(`/api/books/${params.id}`);
  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 items-start">
      <div className="card p-4">
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[var(--card)]">
          {book.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold leading-tight">{book.title}</h1>
        <p className="text-sm text-[var(--muted)]">{book.author}</p>
        {book.price != null && (
          <p className="text-xl font-semibold">{book.price.toFixed(2)} ₸</p>
        )}
        <p className="text-sm leading-relaxed text-[var(--muted)]">{book.description}</p>
        <div className="flex items-center gap-3">
          <AddToCartButton bookId={book.id} />
          <a href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Назад к каталогу</a>
        </div>
      </div>
    </div>
  );
}

function AddToCartButton({ bookId }: { bookId: string }) {
  "use client";
  const { add } = useCart();
  return (
    <button className="btn-accent" onClick={() => add(bookId, 1)}>
      Добавить в корзину
    </button>
  );
}


