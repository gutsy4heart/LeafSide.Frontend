"use client";

import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserWithRole, UserRole, UpdateUserRoleRequest } from "../../types/user";
import { Book, CreateBookRequest, UpdateBookRequest, BOOK_GENRES, BOOK_LANGUAGES } from "../../types/book";
import { Order, OrderStatus, ORDER_STATUSES } from "../../types/order";
import { AdminCart } from "../../types/cart";

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
  const [activeTab, setActiveTab] = useState<'users' | 'books' | 'orders' | 'carts'>('users');
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
    imageUrl: '',
    isAvailable: true
  });
  const [newBookPublishedYearInput, setNewBookPublishedYearInput] = useState<string>(String(newBook.publishedYear));
  const [newBookPageCountInput, setNewBookPageCountInput] = useState<string>('');
  const [newBookPriceInput, setNewBookPriceInput] = useState<string>('');
  const [editingBookPublishedYearInput, setEditingBookPublishedYearInput] = useState<string>('');
  const [editingBookPageCountInput, setEditingBookPageCountInput] = useState<string>('');
  const [editingBookPriceInput, setEditingBookPriceInput] = useState<string>('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [bookGenreFilter, setBookGenreFilter] = useState('all');
  const [bookAvailabilityFilter, setBookAvailabilityFilter] = useState('all');
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<string | null>(null);
  
  // Carts state
  const [carts, setCarts] = useState<AdminCart[]>([]);
  const [cartsLoading, setCartsLoading] = useState(false);
  const [cartsError, setCartsError] = useState<string | null>(null);

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
      fetchOrders();
      fetchCarts();
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

  const fetchOrders = async () => {
    if (!token) {
      console.log('Admin: No token available for fetching orders');
      setOrdersError('Токен не найден');
      setOrdersLoading(false);
      return;
    }

    try {
      console.log('Admin: Fetching orders with token:', token.substring(0, 20) + '...');
      setOrdersLoading(true);
      setOrdersError(null);
      
      const response = await fetch("/api/admin/orders", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Admin: Orders response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin: Orders error response:', errorData);
        throw new Error(errorData.error || "Failed to fetch orders");
      }
      
      const data = await response.json();
      console.log('Admin: Orders data received:', data);
      setOrders(data);
    } catch (err) {
      console.error('Admin: Error fetching orders:', err);
      setOrdersError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCarts = async () => {
    if (!token) {
      console.log('Admin: No token available for fetching carts');
      setCartsError('Токен не найден');
      setCartsLoading(false);
      return;
    }

    try {
      console.log('Admin: Fetching carts with token:', token.substring(0, 20) + '...');
      setCartsLoading(true);
      setCartsError(null);
      
      const response = await fetch("/api/admin/carts", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Admin: Carts response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin: Carts error response:', errorData);
        throw new Error(errorData.error || "Failed to fetch carts");
      }
      
      const data = await response.json();
      console.log('Admin: Carts data received:', data);
      setCarts(data);
    } catch (err) {
      console.error('Admin: Error fetching carts:', err);
      setCartsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCartsLoading(false);
    }
  };

  const createBook = async () => {
    try {
      setCreatingBook(true);
      setBooksError(null);
      const parsedPublishedYear = parseInt(newBookPublishedYearInput, 10);
      const parsedPageCount = parseInt(newBookPageCountInput, 10);
      const parsedPrice = parseFloat((newBookPriceInput || '').replace(',', '.'));
      const errs = validateBook({
        title: newBook.title,
        author: newBook.author,
        publishedYear: Number.isFinite(parsedPublishedYear) ? parsedPublishedYear : NaN,
        pageCount: Number.isFinite(parsedPageCount) ? parsedPageCount : NaN,
        price: Number.isFinite(parsedPrice) ? parsedPrice : NaN,
      });
      setNewBookErrors(errs);
      if (Object.keys(errs).length > 0) {
        showToast('Проверьте корректность полей книги', 'error');
        return;
      }
      
      const payload: CreateBookRequest = {
        ...newBook,
        publishedYear: Number.isFinite(parsedPublishedYear) ? parsedPublishedYear : 0,
        pageCount: Number.isFinite(parsedPageCount) ? parsedPageCount : 0,
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      };

      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
        imageUrl: '',
        isAvailable: true
      });
      setShowAddBookForm(false);
      setNewBookPublishedYearInput(String(new Date().getFullYear()));
      setNewBookPageCountInput('');
      setNewBookPriceInput('');
      
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
      const parsedPublishedYear = parseInt(editingBookPublishedYearInput, 10);
      const parsedPageCount = parseInt(editingBookPageCountInput, 10);
      const parsedPrice = parseFloat((editingBookPriceInput || '').replace(',', '.'));
      const errs = validateBook({
        title: editingBook.title,
        author: editingBook.author,
        publishedYear: Number.isFinite(parsedPublishedYear) ? parsedPublishedYear : NaN,
        pageCount: Number.isFinite(parsedPageCount) ? parsedPageCount : NaN,
        price: Number.isFinite(parsedPrice) ? parsedPrice : NaN,
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
        publishedYear: Number.isFinite(parsedPublishedYear) ? parsedPublishedYear : 0,
        genre: editingBook.genre,
        language: editingBook.language,
        pageCount: Number.isFinite(parsedPageCount) ? parsedPageCount : 0,
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        imageUrl: editingBook.imageUrl,
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
    setEditingBookPublishedYearInput(String(book.publishedYear));
    setEditingBookPageCountInput(String(book.pageCount));
    setEditingBookPriceInput(String(book.price ?? ''));
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
        imageUrl: '',
      isAvailable: true
    });
    setNewBookPublishedYearInput(String(new Date().getFullYear()));
    setNewBookPageCountInput('');
    setNewBookPriceInput('');
  };

  const cancelEditBook = () => {
    setShowEditBookForm(false);
    setEditingBook(null);
    setEditingBookPublishedYearInput('');
    setEditingBookPageCountInput('');
    setEditingBookPriceInput('');
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingOrderStatus(orderId);
      setOrdersError(null);
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении статуса заказа');
      }
      
      // Обновляем локальное состояние
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );
      
      showToast(`Статус заказа обновлен на "${status}"`, 'success');
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      showToast('Ошибка при обновлении статуса заказа', 'error');
    } finally {
      setUpdatingOrderStatus(null);
    }
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
      
      // Бэкенд ожидает [FromForm] в AccountController.Register
      const form = new FormData();
      form.set('Email', newUser.email);
      form.set('Password', newUser.password);
      form.set('FirstName', newUser.firstName);
      form.set('LastName', newUser.lastName);
      form.set('PhoneNumber', newUser.phoneNumber);
      form.set('CountryCode', newUser.countryCode);
      form.set('Gender', newUser.gender);

      const response = await fetch('/api/account/register', {
        method: 'POST',
        body: form,
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

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading || booksLoading || ordersLoading || cartsLoading) {
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
            <div key={t.id} className={`px-4 py-3 rounded shadow text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-[var(--accent)]'}`}>
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
              onClick={async () => {
                try {
                  const res = await fetch('/api/health', { cache: 'no-store' });
                  const data = await res.json();
                  if (res.ok) {
                    showToast(`Бэкенд доступен: ${data.selectedBase}`, 'success');
                  } else {
                    showToast('Бэкенд недоступен, проверьте запуск API', 'error');
                    console.log('Health details:', data);
                  }
                } catch (e) {
                  showToast('Проверка соединения не удалась', 'error');
                }
              }}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16M4 12h8m0 0l-3-3m3 3l-3 3" />
              </svg>
              Проверить бэкенд
            </button>
            <button
              onClick={() => {
                if (activeTab === 'users') fetchUsers();
                else if (activeTab === 'books') fetchBooks();
                else if (activeTab === 'orders') fetchOrders();
                else if (activeTab === 'carts') fetchCarts();
              }}
              disabled={loading || booksLoading || ordersLoading || cartsLoading}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading || booksLoading || ordersLoading || cartsLoading ? 'Загрузка...' : 'Обновить'}
            </button>
            {activeTab === 'users' && (
              <button
                onClick={() => setShowAddUserForm(true)}
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
                onClick={() => setShowAddBookForm(true)}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2"
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
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--card)]'
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
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--card)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Книги ({books.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--card)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Заказы ({orders.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('carts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'carts'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--card)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Корзины ({carts.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {(error || booksError || ordersError || cartsError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error || booksError || ordersError || cartsError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Статистика */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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
      )}
      {activeTab === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
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
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Всего заказов</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ожидающие</p>
                <p className="text-3xl font-bold">{orders.filter(o => o.status === 'Pending').length}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Доставленные</p>
                <p className="text-3xl font-bold">{orders.filter(o => o.status === 'Delivered').length}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Общая сумма</p>
                <p className="text-3xl font-bold">
                  € {orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(0)}
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
      {activeTab === 'carts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Всего корзин</p>
                <p className="text-3xl font-bold">{carts.length}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Активные корзины</p>
                <p className="text-3xl font-bold">{carts.filter(c => c.items.length > 0).length}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Пустые корзины</p>
                <p className="text-3xl font-bold">{carts.filter(c => c.items.length === 0).length}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Средний размер</p>
                <p className="text-3xl font-bold">
                  {carts.length > 0 
                    ? Math.round(carts.reduce((sum, cart) => sum + cart.items.length, 0) / carts.length)
                    : 0
                  } товаров
                </p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
        {activeTab === 'orders' && (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск заказов
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Поиск по клиенту, email или ID заказа..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Все статусы</option>
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setOrderSearchTerm('');
                    setOrderStatusFilter('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Показано {filteredOrders.length} из {orders.length} заказов
            </div>
          </>
        )}
        {activeTab === 'carts' && (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Корзины пользователей
                </label>
                <p className="text-sm text-gray-500">
                  Просмотр корзин всех пользователей системы
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Показано {carts.length} корзин
            </div>
          </>
        )}
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          {activeTab === 'users' ? (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-[var(--card)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Текущая роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-white/10">
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
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {user.userName}
                          </div>
                          <div className="text-sm text-[var(--muted)]">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.roles.includes("Admin") 
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]" 
                          : "bg-[var(--accent)]/10 text-[var(--accent)]"
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
                            className="text-[var(--accent)] hover:text-[var(--accent)]/90 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-3 py-1 rounded-md transition-colors disabled:opacity-50 flex items-center"
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
                            className="text-[var(--accent)] hover:text-[var(--accent)]/90 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-3 py-1 rounded-md transition-colors disabled:opacity-50 flex items-center"
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
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-white/10">
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
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover rounded" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {book.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      € {book.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.isAvailable 
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]" 
                          : "bg-[var(--accent)]/10 text-[var(--accent)]"
                      }`}>
                        {book.isAvailable ? "Доступна" : "Недоступна"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="text-[var(--accent)] hover:text-[var(--accent)]/90 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-3 py-1 rounded-md transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book)}
                          className="text-[var(--accent)] hover:text-[var(--accent)]/90 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-3 py-1 rounded-md transition-colors"
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
          {activeTab === 'orders' && (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-[var(--card)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    ID заказа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-white/10">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">Заказы не найдены</p>
                        <p className="text-gray-500">
                          {orderSearchTerm || orderStatusFilter !== 'all'
                            ? 'Попробуйте изменить параметры поиска или фильтрации'
                            : 'Заказы еще не загружены'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        #{order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-[var(--muted)]">
                            {order.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        € {order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingOrderStatus === order.id}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {ORDER_STATUSES.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          {activeTab === 'carts' && (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-[var(--card)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    ID корзины
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    ID пользователя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Количество товаров
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-white/10">
                {carts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">Корзины не найдены</p>
                        <p className="text-gray-500">
                          Корзины еще не загружены
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  carts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        #{cart.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        #{cart.userId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        {cart.items.length} товаров
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cart.items.length > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cart.items.length > 0 ? 'Активна' : 'Пустая'}
                        </span>
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
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-md transition-colors disabled:opacity-50 flex items-center"
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
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-md transition-colors disabled:opacity-50 flex items-center"
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
          <div className="bg-[var(--card)] border border-white/10 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                Добавить новую книгу
              </h3>
              <button
                onClick={cancelCreateBook}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Автор *
                </label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)] placeholder:[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Год издания *
                </label>
                <input
                  type="text"
                  value={newBookPublishedYearInput}
                  onChange={(e) => setNewBookPublishedYearInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Количество страниц *
                </label>
                <input
                  type="text"
                  value={newBookPageCountInput}
                  onChange={(e) => setNewBookPageCountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/10 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Цена (€) *
                </label>
                <input
                  type="text"
                  value={newBookPriceInput}
                  onChange={(e) => setNewBookPriceInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Жанр
                </label>
                <select
                  value={newBook.genre}
                  onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                >
                  {BOOK_GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Язык
                </label>
                <select
                  value={newBook.language}
                  onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                >
                  {BOOK_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Описание
                </label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  URL обложки
                </label>
                <input
                  type="url"
                  value={newBook.imageUrl}
                  onChange={(e) => setNewBook({...newBook, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newBook.isAvailable}
                    onChange={(e) => setNewBook({...newBook, isAvailable: e.target.checked})}
                    className="rounded border-white/20 text-[var(--accent)] bg-[var(--card)] shadow-sm focus:border-transparent focus:ring focus:ring-[var(--accent)]/40 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-[var(--muted)]">Книга доступна</span>
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
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-md transition-colors disabled:opacity-50 flex items-center"
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
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                Редактировать книгу
              </h3>
              <button
                onClick={cancelEditBook}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                  Автор *
                </label>
                <input
                  type="text"
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={editingBook.isbn}
                  onChange={(e) => setEditingBook({...editingBook, isbn: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Год издания *
                </label>
                <input
                  type="text"
                  value={editingBookPublishedYearInput}
                  onChange={(e) => setEditingBookPublishedYearInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество страниц *
                </label>
                <input
                  type="text"
                  value={editingBookPageCountInput}
                  onChange={(e) => setEditingBookPageCountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (€) *
                </label>
                <input
                  type="text"
                  value={editingBookPriceInput}
                  onChange={(e) => setEditingBookPriceInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL обложки
                </label>
                <input
                  type="url"
                  value={editingBook.imageUrl || ''}
                  onChange={(e) => setEditingBook({...editingBook, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingBook.isAvailable}
                    onChange={(e) => setEditingBook({...editingBook, isAvailable: e.target.checked})}
                    className="rounded border-white/20 text-[var(--accent)] bg-[var(--card)] shadow-sm focus:border-transparent focus:ring focus:ring-[var(--accent)]/40 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-[var(--muted)]">Книга доступна</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelEditBook}
                disabled={updatingBook}
                className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--card)] border border-white/10 hover:bg-[var(--card)]/80 rounded-md transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={updateBook}
                disabled={updatingBook || !editingBook.title || !editingBook.author}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-md transition-colors disabled:opacity-50 flex items-center"
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
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-md transition-colors disabled:opacity-50 flex items-center"
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
