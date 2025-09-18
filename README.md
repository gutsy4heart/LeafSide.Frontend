# LeafSide Frontend

Современное веб-приложение интернет-магазина книг LeafSide, построенное на Next.js 15 с TypeScript и Tailwind CSS.

## 🚀 Технологический стек

- **Next.js 15.5.2** - React фреймворк с App Router
- **React 19.1.0** - UI библиотека
- **TypeScript 5** - типизация
- **Tailwind CSS 4** - utility-first CSS фреймворк
- **ESLint 9** - линтер для качества кода

## 📁 Структура проекта

```
leafside-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── components/               # React компоненты
│   │   │   ├── BookCard.tsx          # Карточка книги
│   │   │   ├── BookForm.tsx          # Форма книги
│   │   │   ├── CartItem.tsx          # Элемент корзины
│   │   │   ├── Header.tsx            # Шапка сайта
│   │   │   ├── LoginForm.tsx         # Форма входа
│   │   │   ├── OrderForm.tsx         # Форма заказа
│   │   │   ├── OrderItem.tsx         # Элемент заказа
│   │   │   ├── RegisterForm.tsx      # Форма регистрации
│   │   │   ├── SearchBar.tsx         # Поисковая строка
│   │   │   ├── UserProfile.tsx       # Профиль пользователя
│   │   │   └── index.ts              # Экспорт компонентов
│   │   ├── api/                      # API routes (Next.js)
│   │   │   ├── auth/                 # Аутентификация
│   │   │   ├── books/                # Книги
│   │   │   ├── cart/                 # Корзина
│   │   │   └── orders/               # Заказы
│   │   ├── admin/                    # Админ панель
│   │   │   └── page.tsx              # Главная админки
│   │   ├── books/                    # Страницы книг
│   │   │   ├── [id]/                 # Детальная страница книги
│   │   │   ├── create/               # Создание книги
│   │   │   └── page.tsx              # Каталог книг
│   │   ├── cart/                     # Корзина
│   │   │   └── page.tsx              # Страница корзины
│   │   ├── login/                    # Вход
│   │   │   └── page.tsx              # Страница входа
│   │   ├── profile/                  # Профиль
│   │   │   └── page.tsx              # Страница профиля
│   │   ├── register/                 # Регистрация
│   │   │   └── page.tsx              # Страница регистрации
│   │   ├── auth-context.tsx          # Контекст аутентификации
│   │   ├── cart-context.tsx          # Контекст корзины
│   │   ├── CartNav.tsx               # Навигация корзины
│   │   ├── globals.css               # Глобальные стили
│   │   ├── layout.tsx                # Корневой layout
│   │   └── page.tsx                  # Главная страница
│   ├── lib/                          # Утилиты и конфигурация
│   │   └── api.ts                    # API клиент
│   └── types/                        # TypeScript типы
│       ├── book.ts                   # Типы для книг
│       ├── cart.ts                   # Типы для корзины
│       ├── order.ts                  # Типы для заказов
│       └── user.ts                   # Типы для пользователей
├── public/                           # Статические файлы
│   ├── leafside-logo.svg             # Логотип
│   └── [другие изображения]
├── package.json                      # Зависимости и скрипты
├── next.config.ts                    # Конфигурация Next.js
├── tailwind.config.js                # Конфигурация Tailwind
├── tsconfig.json                     # Конфигурация TypeScript
└── eslint.config.mjs                 # Конфигурация ESLint
```

## 🎨 UI/UX Особенности

- **Адаптивный дизайн** - работает на всех устройствах
- **Современный интерфейс** - чистый и интуитивный
- **Темная/светлая тема** - поддержка переключения тем
- **Анимации** - плавные переходы и эффекты
- **Accessibility** - доступность для всех пользователей

## 🛠 Установка и запуск

### Предварительные требования
- Node.js 18+ 
- npm или yarn
- Запущенный backend API

### 1. Установка зависимостей
```bash
npm install
# или
yarn install
```

### 2. Настройка окружения
Создайте файл `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
# или для HTTPS
NEXT_PUBLIC_API_URL=https://localhost:7000
```

### 3. Запуск в режиме разработки
```bash
npm run dev
# или
yarn dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

### 4. Сборка для продакшена
```bash
npm run build
# или
yarn build
```

### 5. Запуск продакшен сборки
```bash
npm start
# или
yarn start
```

## 📱 Основные страницы

### Главная страница (`/`)
- Героический баннер с призывом к действию
- Каталог книг в виде сетки карточек
- Поиск и фильтрация книг

### Каталог книг (`/books`)
- Список всех доступных книг
- Поиск по названию, автору, жанру
- Фильтрация по цене, жанру, языку
- Пагинация результатов

### Детальная страница книги (`/books/[id]`)
- Полная информация о книге
- Кнопка добавления в корзину
- Похожие книги
- Отзывы (если реализованы)

### Корзина (`/cart`)
- Список товаров в корзине
- Изменение количества товаров
- Удаление товаров
- Подсчет общей суммы
- Переход к оформлению заказа

### Профиль пользователя (`/profile`)
- Личная информация
- История заказов
- Настройки аккаунта
- Статистика покупок

### Админ панель (`/admin`)
- Управление книгами
- Управление пользователями
- Управление заказами
- Аналитика и статистика

## 🔧 Конфигурация

### Next.js (next.config.ts)
```typescript
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}
```

### Tailwind CSS (tailwind.config.js)
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
      },
    },
  },
  plugins: [],
}
```

### TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🎯 Основные компоненты

### BookCard
Карточка книги с изображением, названием, автором и ценой.

```typescript
interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
  showAddButton?: boolean;
}
```

### CartItem
Элемент корзины с возможностью изменения количества.

```typescript
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
}
```

### SearchBar
Поисковая строка с автодополнением.

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

## 🔐 Аутентификация

### AuthContext
Глобальный контекст для управления состоянием аутентификации.

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

### Защищенные маршруты
Использование middleware для защиты админских страниц.

## 🛒 Управление состоянием

### CartContext
Контекст для управления корзиной покупок.

```typescript
interface CartContextType {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}
```

## 📡 API Интеграция

### API Client (lib/api.ts)
Централизованный клиент для работы с backend API.

```typescript
// Пример использования
const books = await fetchJson<Book[]>('/api/books');
const book = await fetchJson<Book>(`/api/books/${id}`);
```

### Обработка ошибок
Глобальная обработка ошибок API с уведомлениями пользователю.

## 🧪 Тестирование

### Линтинг
```bash
npm run lint
# или
yarn lint
```

### Проверка типов
```bash
npx tsc --noEmit
```

## 🚀 Деплой

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой автоматически при push в main

### Другие платформы
- Netlify
- AWS Amplify
- DigitalOcean App Platform

## 📊 Производительность

### Оптимизации
- **Image Optimization** - автоматическая оптимизация изображений Next.js
- **Code Splitting** - автоматическое разделение кода
- **Lazy Loading** - ленивая загрузка компонентов
- **Static Generation** - статическая генерация страниц где возможно

### Метрики
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s

## 🔧 Разработка

### Структура коммитов
```
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
style: изменить стили
refactor: рефакторинг кода
test: добавить тесты
```

### Создание нового компонента
1. Создайте файл в `src/app/components/`
2. Добавьте TypeScript интерфейсы
3. Экспортируйте из `index.ts`
4. Добавьте в Storybook (если используется)

### Добавление новой страницы
1. Создайте папку в `src/app/`
2. Добавьте `page.tsx`
3. Настройте метаданные
4. Добавьте в навигацию

## 📝 Полезные команды

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Запуск продакшен сборки
npm start

# Линтинг
npm run lint

# Проверка типов
npx tsc --noEmit

# Очистка кэша
rm -rf .next
npm run build
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Запустите линтер и проверку типов
5. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
1. Проверьте Issues в репозитории
2. Создайте новый Issue с подробным описанием
3. Приложите скриншоты и логи ошибок