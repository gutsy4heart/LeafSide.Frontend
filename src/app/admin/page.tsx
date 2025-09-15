"use client";

import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserWithRole, UserRole, UpdateUserRoleRequest } from "../../types/user";
import { Book, CreateBookRequest, UpdateBookRequest, BOOK_GENRES, BOOK_LANGUAGES } from "../../types/book";

export default function AdminPage() {
  const { isAuthenticated, isAdmin, userInfo, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; user: UserWithRole | null }>({
    isOpen: false,
    user: null
  });
  const [deleting, setDeleting] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+7',
    gender: 'Male'
  });
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentUsers: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  
  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showEditBookForm, setShowEditBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookDeleteDialog, setBookDeleteDialog] = useState<{ isOpen: boolean; book: Book | null }>({
    isOpen: false,
    book: null
  });
  const [deletingBook, setDeletingBook] = useState(false);
  const [creatingBook, setCreatingBook] = useState(false);
  const [updatingBook, setUpdatingBook] = useState(false);
  const [newBook, setNewBook] = useState<CreateBookRequest>({
    title: '',
    author: '',
    description: '',
    isbn: '',
    publishedYear: new Date().getFullYear(),
    genre: 'Fiction',
    language: 'Russian',
    pageCount: 0,
    price: 0,
    coverImageUrl: '',
    isAvailable: true
  });
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [bookGenreFilter, setBookGenreFilter] = useState('all');
  const [bookAvailabilityFilter, setBookAvailabilityFilter] = useState('all');

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    // auto dismiss
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // Simple field validation states
  const [newBookErrors, setNewBookErrors] = useState<Record<string, string>>({});
  const [editingBookErrors, setEditingBookErrors] = useState<Record<string, string>>({});
  const [newUserErrors, setNewUserErrors] = useState<Record<string, string>>({});

  const validateBook = (b: { title?: string; author?: string; publishedYear?: number; pageCount?: number; price?: number; }) => {
    const errors: Record<string, string> = {};
    if (!b.title || b.title.trim().length === 0) errors.title = 'Название обязательно';
    if (!b.author || b.author.trim().length === 0) errors.author = 'Автор обязателен';
    const year = b.publishedYear ?? 0;
    if (!Number.isFinite(year) || year < 1000 || year > new Date().getFullYear() + 1) errors.publishedYear = 'Некорректный год';
    const pages = b.pageCount ?? 0;
    if (!Number.isFinite(pages) || pages < 1) errors.pageCount = 'Минимум 1 страница';
    const price = b.price ?? 0;
    if (!Number.isFinite(price) || price < 0) errors.price = 'Цена не может быть отрицательной';
    return errors;
  };

  const validateNewUser = (u: { email: string; password: string; firstName: string; lastName: string; }) => {
    const errors: Record<string, string> = {};
    if (!u.email || !u.email.includes('@')) errors.email = 'Укажите корректный email';
    if (!u.password || u.password.length < 6) errors.password = 'Минимум 6 символов';
    if (!u.firstName) errors.firstName = 'Имя обязательно';
    if (!u.lastName) errors.lastName = 'Фамилия обязательна';
    return errors;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (!isAdmin) {
      router.push("/");
      return;
    }
    
    // Ждем пока токен будет доступен
    if (token) {
      fetchUsers();
      fetchBooks();
    }
  }, [isAuthenticated, isAdmin, token, router]);

  const fetchUsers = async () => {
    if (!token) {
      console.log('Admin: No token available for fetching users');
      setError('Токен не найден');
      setLoading(false);
      return;
    }

    try {
      console.log('Admin: Fetching users with token:', token.substring(0, 20) + '...');
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/users", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Admin: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin: Error response:', errorData);
        throw new Error(errorData.error || "Failed to fetch users");
      }
      
      const data = await response.json();
      console.log('Admin: Users data received:', data);
      setUsers(data);
      
      // Рассчитываем статистику
      const totalUsers = data.length;
      const adminUsers = data.filter((user: any) => user.roles.includes('Admin')).length;
      const regularUsers = totalUsers - adminUsers;
      const recentUsers = data.filter((user: any) => {
        const createdAt = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
      }).length;
      
      setStats({
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers
      });
    } catch (err) {
      console.error('Admin: Error fetching users:', err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    if (!token) {
      console.log('Admin: No token available for fetching books');
      setBooksError('Токен не найден');
      setBooksLoading(false);
      return;
    }

    try {
      console.log('Admin: Fetching books with token:', token.substring(0, 20) + '...');
      setBooksLoading(true);
      setBooksError(null);
      
      const response = await fetch("/api/admin/books", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Admin: Books response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin: Books error response:', errorData);
        throw new Error(errorData.error || "Failed to fetch books");
      }
      
      const data = await response.json();
      console.log('Admin: Books data received:', data);
      setBooks(data);
    } catch (err) {
      console.error('Admin: Error fetching books:', err);
      setBooksError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBooksLoading(false);
    }
  };

  const createBook = async () => {
    try {
      setCreatingBook(true);
      setBooksError(null);
      const errs = validateBook({
        title: newBook.title,
        author: newBook.author,
        publishedYear: newBook.publishedYear,
        pageCount: newBook.pageCount,
        price: newBook.price,
      });
      setNewBookErrors(errs);
      if (Object.keys(errs).length > 0) {
        showToast('Проверьте корректность полей книги', 'error');
        return;
      }
      
      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании книги');
      }
      
      // Обновляем список книг
      await fetchBooks();
      showToast(`Книга "${newBook.title}" создана`, 'success');
      
      // Сбрасываем форму
      setNewBook({
        title: '',
        author: '',
        description: '',
        isbn: '',
        publishedYear: new Date().getFullYear(),
        genre: 'Fiction',
        language: 'Russian',
        pageCount: 0,
        price: 0,
        coverImageUrl: '',
        isAvailable: true
      });
      setShowAddBookForm(false);
      
    } catch (err) {
      setBooksError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      showToast('Ошибка при создании книги', 'error');
    } finally {
      setCreatingBook(false);
    }
  };

  const updateBook = async () => {
    if (!editingBook) return;
    
    try {
      setUpdatingBook(true);
      setBooksError(null);
      const errs = validateBook({
        title: editingBook.title,
        author: editingBook.author,
        publishedYear: editingBook.publishedYear,
        pageCount: editingBook.pageCount,
        price: editingBook.price,
      });
      setEditingBookErrors(errs);
      if (Object.keys(errs).length > 0) {
        showToast('Проверьте корректность полей книги', 'error');
        return;
      }
      
      const updateData: UpdateBookRequest = {
        title: editingBook.title,
        author: editingBook.author,
        description: editingBook.description,
        isbn: editingBook.isbn,
        publishedYear: editingBook.publishedYear,
        genre: editingBook.genre,
        language: editingBook.language,
        pageCount: editingBook.pageCount,
        price: editingBook.price,
        coverImageUrl: editingBook.coverImageUrl,
        isAvailable: editingBook.isAvailable
      };
      
      const response = await fetch(`/api/admin/books/${editingBook.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении книги');
      }
      
      // Обновляем список книг
      await fetchBooks();
      showToast(`Книга "${editingBook.title}" обновлена`, 'success');
      
      // Закрываем форму редактирования
      setShowEditBookForm(false);
      setEditingBook(null);
      
    } catch (err) {
      setBooksError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      showToast('Ошибка при обновлении книги', 'error');
    } finally {
      setUpdatingBook(false);
    }
  };

  const deleteBook = async () => {
    if (!bookDeleteDialog.book) return;
    
    try {
      setDeletingBook(true);
      const response = await fetch(`/api/admin/books/${bookDeleteDialog.book.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete book");
      }
      
      // Удаляем книгу из локального состояния
      setBooks(books.filter(book => book.id !== bookDeleteDialog.book!.id));
      setBookDeleteDialog({ isOpen: false, book: null });
      showToast(`Книга "${bookDeleteDialog.book.title}" удалена`, 'success');
    } catch (err) {
      setBooksError(err instanceof Error ? err.message : "Unknown error");
      showToast('Ошибка при удалении книги', 'error');
    } finally {
      setDeletingBook(false);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook({ ...book });
    setShowEditBookForm(true);
  };

  const handleDeleteBook = (book: Book) => {
    setBookDeleteDialog({ isOpen: true, book });
  };

  const cancelBookDelete = () => {
    setBookDeleteDialog({ isOpen: false, book: null });
  };

  const cancelCreateBook = () => {
    setShowAddBookForm(false);
    setNewBook({
      title: '',
      author: '',
      description: '',
      isbn: '',
      publishedYear: new Date().getFullYear(),
      genre: 'Fiction',
      language: 'Russian',
      pageCount: 0,
      price: 0,
      coverImageUrl: '',
      isAvailable: true
    });
  };

  const cancelEditBook = () => {
    setShowEditBookForm(false);
    setEditingBook(null);
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      setUpdatingRole(userId);
      setError(null);
      
      // Преобразуем enum в числовое значение для бэкенда
      const roleValue = role === UserRole.Admin ? 1 : 0;
      const request = { 
        userId, 
        role: roleValue 
      };
      
      console.log('Admin: Updating user role:', { userId, role, roleValue });
      
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin: Error updating user role:', errorData);
        throw new Error(errorData.error || "Failed to update user role");
      }
      
      const result = await response.json();
      console.log('Admin: Role updated successfully:', result);
      
      // Обновляем локальное состояние
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, roles: [role] }
            : user
        )
      );
      
      // Обновляем статистику
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteUser = (user: UserWithRole) => {
    setDeleteDialog({ isOpen: true, user });
  };

  const confirmDeleteUser = async () => {
    if (!deleteDialog.user) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/users/${deleteDialog.user.id}/delete`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }
      
      // Удаляем пользователя из локального состояния
      setUsers(users.filter(user => user.id !== deleteDialog.user!.id));
      setDeleteDialog({ isOpen: false, user: null });
      showToast(`Пользователь ${deleteDialog.user.email} удален`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      showToast('Ошибка при удалении пользователя', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteUser = () => {
    setDeleteDialog({ isOpen: false, user: null });
  };

  const handleCreateUser = async () => {
    try {
      setCreating(true);
      setError(null);
      const errs = validateNewUser(newUser as any);
      setNewUserErrors(errs);
      if (Object.keys(errs).length > 0) {
        showToast('Проверьте корректность полей пользователя', 'error');
        return;
      }
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании пользователя');
      }
      
      // Обновляем список пользователей
      await fetchUsers();
      showToast(`Пользователь ${newUser.email} создан`, 'success');
      
      // Сбрасываем форму
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        countryCode: '+7',
        gender: 'Male'
      });
      setShowAddUserForm(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      showToast('Ошибка при создании пользователя', 'error');
    } finally {
      setCreating(false);
    }
  };

  const cancelCreateUser = () => {
    setShowAddUserForm(false);
    setNewUser({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      countryCode: '+7',
      gender: 'Male'
    });
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && user.roles.includes('Admin')) ||
                       (roleFilter === 'user' && !user.roles.includes('Admin'));
    return matchesSearch && matchesRole;
  });

  // Фильтрация книг
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(bookSearchTerm.toLowerCase());
    const matchesGenre = bookGenreFilter === 'all' || book.genre === bookGenreFilter;
    const matchesAvailability = bookAvailabilityFilter === 'all' || 
                               (bookAvailabilityFilter === 'available' && book.isAvailable) ||
                               (bookAvailabilityFilter === 'unavailable' && !book.isAvailable);
    return matchesSearch && matchesGenre && matchesAvailability;
  });

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading || booksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        {/* Toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded shadow text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
              {t.message}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
              Админ панель
            </h1>
            <p className="text-[var(--muted)]">
              Управление пользователями и книгами системы
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={activeTab === 'users' ? fetchUsers : fetchBooks}
              disabled={loading || booksLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading || booksLoading ? 'Загрузка...' : 'Обновить'}
            </button>
            {activeTab === 'users' ? (
              <button
                onClick={() => setShowAddUserForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить пользователя
              </button>
            ) : (
              <button
                onClick={() => setShowAddBookForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить книгу
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Пользователи ({users.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Книги ({books.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {(error || booksError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error || booksError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Статистика */}
      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Всего пользователей</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Обычные пользователи</p>
                <p className="text-3xl font-bold">{stats.regularUsers}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Администраторы</p>
                <p className="text-3xl font-bold">{stats.adminUsers}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Новые за неделю</p>
                <p className="text-3xl font-bold">{stats.recentUsers}</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Всего книг</p>
                <p className="text-3xl font-bold">{books.length}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Доступные книги</p>
                <p className="text-3xl font-bold">{books.filter(b => b.isAvailable).length}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Недоступные книги</p>
                <p className="text-3xl font-bold">{books.filter(b => !b.isAvailable).length}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Средняя цена</p>
                <p className="text-3xl font-bold">
                  € {books.length > 0 
                    ? Math.round(books.reduce((sum, book) => sum + book.price, 0) / books.length)
                    : 0
                  }
                </p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Поиск и фильтрация */}
      <div className="card p-6 mb-6">
          {activeTab === 'users' ? (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск пользователей
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Поиск по email или имени..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фильтр по роли
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Все роли</option>
                  <option value="admin">Администраторы</option>
                  <option value="user">Пользователи</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Показано {filteredUsers.length} из {users.length} пользователей
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск книг
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Поиск по названию, автору или ISBN..."
                    value={bookSearchTerm}
                    onChange={(e) => setBookSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Жанр
                </label>
                <select
                  value={bookGenreFilter}
                  onChange={(e) => setBookGenreFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Все жанры</option>
                  {BOOK_GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Доступность
                </label>
                <select
                  value={bookAvailabilityFilter}
                  onChange={(e) => setBookAvailabilityFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Все</option>
                  <option value="available">Доступные</option>
                  <option value="unavailable">Недоступные</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setBookSearchTerm('');
                    setBookGenreFilter('all');
                    setBookAvailabilityFilter('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Показано {filteredBooks.length} из {books.length} книг
            </div>
          </>
        )}
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          {activeTab === 'users' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Текущая роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</p>
                        <p className="text-gray-500">
                          {searchTerm || roleFilter !== 'all' 
                            ? 'Попробуйте изменить параметры поиска или фильтрации'
                            : 'Пользователи еще не загружены'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.roles.includes("Admin") 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {user.roles.includes("Admin") ? "Администратор" : "Пользователь"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.roles.includes("Admin") ? (
                          <button
                            onClick={() => updateUserRole(user.id, UserRole.User)}
                            disabled={updatingRole === user.id}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors disabled:opacity-50 flex items-center"
                          >
                            {updatingRole === user.id && (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {updatingRole === user.id ? 'Обновление...' : 'Сделать пользователем'}
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserRole(user.id, UserRole.Admin)}
                            disabled={updatingRole === user.id}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors disabled:opacity-50 flex items-center"
                          >
                            {updatingRole === user.id && (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {updatingRole === user.id ? 'Обновление...' : 'Сделать админом'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                          disabled={user.id === userInfo?.id}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Книга
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Автор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Жанр
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">Книги не найдены</p>
                        <p className="text-gray-500">
                          {bookSearchTerm || bookGenreFilter !== 'all' || bookAvailabilityFilter !== 'all'
                            ? 'Попробуйте изменить параметры поиска или фильтрации'
                            : 'Книги еще не загружены'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-medium mr-4">
                          {book.coverImageUrl ? (
                            <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover rounded" />
                          ) : (
                            <span>{book.title.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {book.publishedYear} • {book.pageCount} стр.
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      € {book.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.isAvailable 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {book.isAvailable ? "Доступна" : "Недоступна"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Форма добавления пользователя */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Добавить нового пользователя
              </h3>
              <button
                onClick={cancelCreateUser}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {newUserErrors.email && <p className="text-sm text-red-600 mt-1">{newUserErrors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {newUserErrors.password && <p className="text-sm text-red-600 mt-1">{newUserErrors.password}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {newUserErrors.firstName && <p className="text-sm text-red-600 mt-1">{newUserErrors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия *
                </label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {newUserErrors.lastName && <p className="text-sm text-red-600 mt-1">{newUserErrors.lastName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер телефона
                </label>
                <div className="flex">
                  <select
                    value={newUser.countryCode}
                    onChange={(e) => setNewUser({...newUser, countryCode: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="+7">+7</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+49">+49</option>
                    <option value="+33">+33</option>
                  </select>
                  <input
                    type="tel"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пол
                </label>
                <select
                  value={newUser.gender}
                  onChange={(e) => setNewUser({...newUser, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Мужской</option>
                  <option value="Female">Женский</option>
                  <option value="Other">Другой</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelCreateUser}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating || !newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {creating && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {creating ? 'Создание...' : 'Создать пользователя'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Подтверждение удаления
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Вы уверены, что хотите удалить пользователя <strong>{deleteDialog.user?.email}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Это действие нельзя отменить!
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteUser}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {deleting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Форма добавления книги */}
      {showAddBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Добавить новую книгу
              </h3>
              <button
                onClick={cancelCreateBook}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Автор *
                </label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Год издания *
                </label>
                <input
                  type="number"
                  value={Number.isFinite(newBook.publishedYear) ? newBook.publishedYear : 0}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewBook({
                      ...newBook,
                      publishedYear: v === '' ? 0 : parseInt(v)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество страниц *
                </label>
                <input
                  type="number"
                  value={Number.isFinite(newBook.pageCount) ? newBook.pageCount : 0}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewBook({
                      ...newBook,
                      pageCount: v === '' ? 0 : parseInt(v)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  value={Number.isFinite(newBook.price) ? newBook.price : 0}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewBook({
                      ...newBook,
                      price: v === '' ? 0 : parseFloat(v)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Жанр
                </label>
                <select
                  value={newBook.genre}
                  onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BOOK_GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Язык
                </label>
                <select
                  value={newBook.language}
                  onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BOOK_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL обложки
                </label>
                <input
                  type="url"
                  value={newBook.coverImageUrl}
                  onChange={(e) => setNewBook({...newBook, coverImageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newBook.isAvailable}
                    onChange={(e) => setNewBook({...newBook, isAvailable: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Книга доступна</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelCreateBook}
                disabled={creatingBook}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={createBook}
                disabled={creatingBook || !newBook.title || !newBook.author}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {creatingBook && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {creatingBook ? 'Создание...' : 'Создать книгу'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Форма редактирования книги */}
      {showEditBookForm && editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Редактировать книгу
              </h3>
              <button
                onClick={cancelEditBook}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Автор *
                </label>
                <input
                  type="text"
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={editingBook.isbn}
                  onChange={(e) => setEditingBook({...editingBook, isbn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Год издания *
                </label>
                <input
                  type="number"
                  value={Number.isFinite(editingBook.publishedYear) ? editingBook.publishedYear : 0}
                  onChange={(e) => setEditingBook({...editingBook, publishedYear: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество страниц *
                </label>
                <input
                  type="number"
                  value={Number.isFinite(editingBook.pageCount) ? editingBook.pageCount : 0}
                  onChange={(e) => setEditingBook({...editingBook, pageCount: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  value={Number.isFinite(editingBook.price) ? editingBook.price : 0}
                  onChange={(e) => setEditingBook({...editingBook, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Жанр
                </label>
                <select
                  value={editingBook.genre}
                  onChange={(e) => setEditingBook({...editingBook, genre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BOOK_GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Язык
                </label>
                <select
                  value={editingBook.language}
                  onChange={(e) => setEditingBook({...editingBook, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BOOK_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({...editingBook, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL обложки
                </label>
                <input
                  type="url"
                  value={editingBook.coverImageUrl || ''}
                  onChange={(e) => setEditingBook({...editingBook, coverImageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingBook.isAvailable}
                    onChange={(e) => setEditingBook({...editingBook, isAvailable: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Книга доступна</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelEditBook}
                disabled={updatingBook}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={updateBook}
                disabled={updatingBook || !editingBook.title || !editingBook.author}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {updatingBook && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {updatingBook ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления книги */}
      {bookDeleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Подтверждение удаления
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Вы уверены, что хотите удалить книгу <strong>{bookDeleteDialog.book?.title}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Это действие нельзя отменить!
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelBookDelete}
                disabled={deletingBook}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={deleteBook}
                disabled={deletingBook}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {deletingBook && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {deletingBook ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
