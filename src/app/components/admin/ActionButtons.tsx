"use client";

interface ActionButtonsProps {
  activeTab: 'users' | 'books' | 'orders' | 'carts';
  loading: boolean;
  booksLoading: boolean;
  ordersLoading: boolean;
  cartsLoading: boolean;
  onRefresh: () => void;
  onAddUser: () => void;
  onAddBook: () => void;
  onCheckBackend: () => void;
}

export default function ActionButtons({
  activeTab,
  loading,
  booksLoading,
  ordersLoading,
  cartsLoading,
  onRefresh,
  onAddUser,
  onAddBook,
  onCheckBackend
}: ActionButtonsProps) {
  const isLoading = loading || booksLoading || ordersLoading || cartsLoading;

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onCheckBackend}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Проверить бэкенд
      </button>
      
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {isLoading ? 'Загрузка...' : 'Обновить'}
      </button>
      
      {activeTab === 'users' && (
        <button
          onClick={onAddUser}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Добавить пользователя
        </button>
      )}
      
      {activeTab === 'books' && (
        <button
          onClick={onAddBook}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Добавить книгу
        </button>
      )}
    </div>
  );
}
