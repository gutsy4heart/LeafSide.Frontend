"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CountrySelect from "../components/CountrySelect";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("KZ");
  const [phoneCode, setPhoneCode] = useState("+7");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Функция валидации
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!firstName.trim()) errors.firstName = "Имя обязательно";
    if (!lastName.trim()) errors.lastName = "Фамилия обязательна";
    if (!email.trim()) errors.email = "Email обязателен";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Неверный формат email";
    if (!phoneNumber.trim()) errors.phoneNumber = "Номер телефона обязателен";
    else if (!/^\d{10,15}$/.test(phoneNumber.replace(/\D/g, ''))) errors.phoneNumber = "Неверный формат номера";
    if (!gender) errors.gender = "Выберите пол";
    if (!password) errors.password = "Пароль обязателен";
    else if (password.length < 6) errors.password = "Пароль должен содержать минимум 6 символов";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Прогресс заполнения формы
  const getFormProgress = () => {
    const fields = [firstName, lastName, email, phoneNumber, gender, password];
    const filledFields = fields.filter(field => field.trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    setValidationErrors({});
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const form = new FormData();
      form.append("Email", email);
      form.append("Password", password);
      form.append("FirstName", firstName);
      form.append("LastName", lastName);
      form.append("PhoneNumber", phoneNumber);
      form.append("CountryCode", countryCode);
      form.append("Gender", gender);
      
      const res = await fetch("/api/account/register", { 
        method: "POST", 
        body: form 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Ошибка регистрации";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      setOk(true);
      // Автоматически перенаправляем на страницу входа через 2 секунды
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (err: any) {
      console.error("Ошибка регистрации:", err);
      setError(err?.message ?? "Произошла ошибка при регистрации. Проверьте данные и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Создать аккаунт
          </h1>
          <p className="text-[var(--muted)] text-lg">Присоединяйтесь к нашему сообществу читателей</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6 card p-6">
          {/* Прогресс-бар */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Прогресс заполнения</span>
              <span className="text-[var(--foreground)] font-medium">{getFormProgress()}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getFormProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Личная информация */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Личная информация
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--foreground)]">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input 
                  id="firstName"
                  className={`w-full h-10 rounded-lg bg-[var(--card)] border px-3 py-2 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/30 ${
                    validationErrors.firstName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-white/20'
                  }`}
                  placeholder="Введите имя" 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                  disabled={loading}
                />
                {validationErrors.firstName && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--foreground)]">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <input 
                  id="lastName"
                  className={`w-full h-10 rounded-lg bg-[var(--card)] border px-3 py-2 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/30 ${
                    validationErrors.lastName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-white/20'
                  }`}
                  placeholder="Введите фамилию" 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                  disabled={loading}
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                id="email"
                className={`w-full h-10 rounded-lg bg-[var(--card)] border px-3 py-2 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/30 ${
                  validationErrors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/20'
                }`}
                placeholder="example@email.com" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* Контактная информация */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Контактная информация
              </h3>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Номер телефона <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="w-40">
                  <CountrySelect
                    value={countryCode}
                    onChange={(code, phone) => {
                      setCountryCode(code);
                      setPhoneCode(phone);
                    }}
                    disabled={loading}
                  />
                </div>
                <input 
                  className={`flex-1 h-10 rounded-lg bg-[var(--card)] border px-3 py-2 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/30 ${
                    validationErrors.phoneNumber 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-white/20'
                  }`}
                  placeholder="Номер телефона" 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              {validationErrors.phoneNumber ? (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.phoneNumber}
                </p>
              ) : (
                <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Выбранный код страны: <span className="font-medium text-[var(--foreground)]">{phoneCode}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Пол <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "Male", label: "Мужской", icon: "👨" },
                  { value: "Female", label: "Женский", icon: "👩" },
                  { value: "Other", label: "Другой", icon: "👤" }
                ].map((option) => (
                  <label key={option.value} className="relative">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={loading}
                      className="sr-only"
                    />
                    <div className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      gender === option.value 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : validationErrors.gender
                        ? 'border-red-500 bg-red-500/5'
                        : 'border-white/20 bg-[var(--card)] hover:border-white/40 hover:bg-[var(--card)]/80'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-xs font-medium text-[var(--foreground)] text-center">{option.label}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {validationErrors.gender && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.gender}
                </p>
              )}
            </div>
          </div>

          {/* Безопасность */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Безопасность
              </h3>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
                Пароль <span className="text-red-500">*</span>
              </label>
              <input 
                id="password"
                className={`w-full h-10 rounded-lg bg-[var(--card)] border px-3 py-2 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/30 ${
                  validationErrors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/20'
                }`}
                placeholder="Минимум 6 символов" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={loading}
              />
              {validationErrors.password ? (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validationErrors.password}
                </p>
              ) : password ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          password.length >= 8 ? 'bg-green-500' : 
                          password.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((password.length / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {password.length >= 8 ? 'Сильный' : password.length >= 6 ? 'Средний' : 'Слабый'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Пароль должен содержать минимум 6 символов
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[var(--muted)]">
                  Пароль должен содержать минимум 6 символов
                </p>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-500 mb-1">
                    Ошибка регистрации
                  </h3>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {ok && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-500 mb-1">
                    Регистрация успешна!
                  </h3>
                  <p className="text-sm text-green-400">Аккаунт создан. Перенаправляем на страницу входа...</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Кнопка регистрации */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading || ok}
              className="w-full h-11 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Создание аккаунта...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Создать аккаунт</span>
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-[var(--muted)]">
              Уже есть аккаунт?{" "}
              <a 
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors" 
                href="/login"
              >
                Войти
              </a>
            </p>
          </div>
      </form>
      </div>
    </div>
  );
}


