"use client";

import { UserWithRole, UserRole } from "../../../types/user";

interface UserManagementProps {
  users: UserWithRole[];
  filteredUsers: UserWithRole[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (filter: string) => void;
  updatingRole: string | null;
  updateUserRole: (userId: string, role: UserRole) => void;
  handleDeleteUser: (user: UserWithRole) => void;
  setShowAddUserForm: (show: boolean) => void;
}

export default function UserManagement({
  users,
  filteredUsers,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  updatingRole,
  updateUserRole,
  handleDeleteUser,
  setShowAddUserForm
}: UserManagementProps) {
  return (
    <>
      {/* Поиск и фильтрация */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Поиск пользователей
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Поиск по email или имени..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-white/20 rounded-lg leading-5 bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Фильтр по роли
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-white/20 rounded-lg leading-5 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            >
              <option value="all">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="user">Пользователи</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-[var(--muted)]">
          Показано {filteredUsers.length} из {users.length} пользователей
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="card p-4 sm:p-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-[var(--muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-lg font-medium text-[var(--foreground)] mb-2">Пользователи не найдены</p>
              <p className="text-[var(--muted)]">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска или фильтрации'
                  : 'Пользователи будут отображены здесь'
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
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
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--foreground)]">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.roles.includes('Admin') ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                              Администратор
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                              Пользователь
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.roles.includes('Admin') ? 'Admin' : 'User'}
                            onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                            disabled={updatingRole === user.id}
                            className="text-sm border border-white/20 rounded px-2 py-1 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-50"
                          >
                            <option value="User">Пользователь</option>
                            <option value="Admin">Администратор</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-400 hover:text-red-300 p-1 transition-colors"
                            title="Удалить пользователя"
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
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-[var(--card)] border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {user.userName}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.roles.includes('Admin') ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          Администратор
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          Пользователь
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-[var(--muted)] mb-1">Email:</div>
                    <div className="text-sm text-[var(--foreground)] break-all">{user.email}</div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={user.roles.includes('Admin') ? 'Admin' : 'User'}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      disabled={updatingRole === user.id}
                      className="flex-1 text-sm border border-white/20 rounded px-3 py-2 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-50"
                    >
                      <option value="User">Пользователь</option>
                      <option value="Admin">Администратор</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-300/40 rounded transition-colors flex items-center justify-center gap-2"
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
