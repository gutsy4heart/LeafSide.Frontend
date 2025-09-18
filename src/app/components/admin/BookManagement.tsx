"use client";

import { Book, BOOK_GENRES, BOOK_LANGUAGES } from "../../../types/book";

interface BookManagementProps {
  books: Book[];
  filteredBooks: Book[];
  bookSearchTerm: string;
  setBookSearchTerm: (term: string) => void;
  bookGenreFilter: string;
  setBookGenreFilter: (filter: string) => void;
  bookAvailabilityFilter: string;
  setBookAvailabilityFilter: (filter: string) => void;
  handleEditBook: (book: Book) => void;
  handleDeleteBook: (book: Book) => void;
  setShowAddBookForm: (show: boolean) => void;
}

export default function BookManagement({
  books,
  filteredBooks,
  bookSearchTerm,
  setBookSearchTerm,
  bookGenreFilter,
  setBookGenreFilter,
  bookAvailabilityFilter,
  setBookAvailabilityFilter,
  handleEditBook,
  handleDeleteBook,
  setShowAddBookForm
}: BookManagementProps) {
  return (
    <>
      {/* Поиск и фильтрация */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Поиск книг
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Поиск по названию, автору или ISBN..."
                value={bookSearchTerm}
                onChange={(e) => setBookSearchTerm(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-white/20 rounded-lg leading-5 bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Жанр
            </label>
            <select
              value={bookGenreFilter}
              onChange={(e) => setBookGenreFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-white/20 rounded-lg leading-5 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            >
              <option value="all">Все жанры</option>
              {BOOK_GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Доступность
            </label>
            <select
              value={bookAvailabilityFilter}
              onChange={(e) => setBookAvailabilityFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-white/20 rounded-lg leading-5 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            >
              <option value="all">Все</option>
              <option value="available">Доступные</option>
              <option value="unavailable">Недоступные</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-[var(--muted)]">
          Показано {filteredBooks.length} из {books.length} книг
        </div>
      </div>

      {/* Таблица книг */}
      <div className="card p-4 sm:p-6">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-[var(--muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg font-medium text-[var(--foreground)] mb-2">Книги не найдены</p>
              <p className="text-[var(--muted)]">
                {bookSearchTerm || bookGenreFilter !== 'all' || bookAvailabilityFilter !== 'all'
                  ? 'Попробуйте изменить параметры поиска или фильтрации'
                  : 'Книги будут отображены здесь'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-[var(--card)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                      Книга
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                      Автор
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                      Жанр
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                      Доступность
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card)] divide-y divide-white/10">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-medium mr-4">
                            {book.imageUrl ? (
                              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover rounded" />
                            ) : (
                              <span>{book.title.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">
                              {book.title}
                            </div>
                            <div className="text-sm text-[var(--muted)]">
                              ISBN: {book.isbn}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--foreground)]">{book.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          {book.genre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--foreground)]">
                          {book.price.toLocaleString('ru-RU')} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.isAvailable 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {book.isAvailable ? 'Доступна' : 'Недоступна'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                            title="Редактировать книгу"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="text-red-400 hover:text-red-300 p-1 transition-colors"
                            title="Удалить книгу"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredBooks.map((book) => (
                <div key={book.id} className="bg-[var(--card)] border border-white/10 rounded-lg p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-lg font-medium flex-shrink-0">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover rounded" />
                      ) : (
                        <span>{book.title.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--foreground)] mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] mb-2">{book.author}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          {book.genre}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.isAvailable 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {book.isAvailable ? 'Доступна' : 'Недоступна'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {book.price.toLocaleString('ru-RU')} €
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-[var(--muted)] mb-1">ISBN:</div>
                    <div className="text-xs text-[var(--foreground)] font-mono">{book.isbn}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="flex-1 px-3 py-2 text-blue-400 hover:text-blue-300 border border-blue-400/20 hover:border-blue-300/40 rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm">Редактировать</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book)}
                      className="flex-1 px-3 py-2 text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-300/40 rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm">Удалить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
