'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Role {
  id: string;
  name: string;
  display_name: string;
  level: number;
  description?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  subscription_status: string | null;
  is_admin: boolean;
  role_id: string | null;
  user_type: string;
  created_at: string;
  roles: Role | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type FilterType = '' | 'staff' | 'clients' | string;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<FilterType>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);

      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard?error=unauthorized');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setRoles(data.roles);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
      setMessage({ type: 'error', text: 'Errore caricamento utenti' });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, pagination.limit, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  async function handleAssignRole(userId: string, roleName: string) {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowRoleModal(false);
        setSelectedUser(null);
        fetchUsers(pagination.page);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore assegnazione ruolo' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveRole(userId: string) {
    if (!confirm('Sei sicuro di voler rimuovere il ruolo? L\'utente diventerà un cliente normale.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchUsers(pagination.page);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore rimozione ruolo' });
    } finally {
      setActionLoading(false);
    }
  }

  function getRoleBadgeColor(level: number): string {
    if (level >= 100) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (level >= 80) return 'bg-red-100 text-red-800 border-red-300';
    if (level >= 40) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  function getTierBadgeColor(tier: string): string {
    switch (tier) {
      case 'partner_elite': return 'bg-amber-100 text-amber-800';
      case 'mastermind': return 'bg-purple-100 text-purple-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'leader': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestione Utenti e Ruoli
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Assegna ruoli admin/staff agli utenti
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/ai-coach')}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Dashboard AI Coach
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cerca per email o nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tutti gli utenti</option>
              <option value="staff">Solo Staff/Admin</option>
              <option value="clients">Solo Clienti</option>
              <optgroup label="Ruoli specifici">
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Stats */}
            <div className="text-sm text-gray-500 dark:text-gray-400 self-center">
              {pagination.total} utenti totali
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
              <p className="mt-4 text-gray-500">Caricamento utenti...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nessun utente trovato
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruolo Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrato</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                            {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.full_name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTierBadgeColor(user.subscription_tier)}`}>
                          {user.subscription_tier || 'explorer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.roles ? (
                          <span className={`px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(user.roles.level)}`}>
                            {user.roles.display_name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Cliente</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700"
                          >
                            {user.roles ? 'Cambia Ruolo' : 'Assegna Ruolo'}
                          </button>
                          {user.roles && (
                            <button
                              onClick={() => handleRemoveRole(user.id)}
                              disabled={actionLoading}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Rimuovi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Pagina {pagination.page} di {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Precedente
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Successiva
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Assegna Ruolo a {selectedUser.full_name || selectedUser.email}
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                Seleziona un ruolo da assegnare. L&apos;utente avra accesso alle funzionalita previste dal ruolo.
              </p>

              <div className="space-y-3">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleAssignRole(selectedUser.id, role.name)}
                    disabled={actionLoading}
                    className={`w-full p-4 text-left border rounded-lg hover:border-amber-500 transition-colors disabled:opacity-50 ${
                      selectedUser.roles?.id === role.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {role.display_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {role.description || role.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(role.level)}`}>
                        Level {role.level}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Legenda Ruoli</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full border bg-purple-100 text-purple-800 border-purple-300">Super Admin</span>
              <span className="text-xs text-gray-500">Accesso totale (100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full border bg-red-100 text-red-800 border-red-300">Admin</span>
              <span className="text-xs text-gray-500">Gestione (80)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full border bg-blue-100 text-blue-800 border-blue-300">Consulente</span>
              <span className="text-xs text-gray-500">Accesso limitato (40)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Cliente</span>
              <span className="text-xs text-gray-500">Usa subscription_tier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
