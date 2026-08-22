import React, { useEffect, useState } from 'react';
import { apiClient, handleApiError } from '../../lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: number;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<any>('/api/users');
      if (response.data.success && response.data.data?.users) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      await handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const response = await apiClient.post<any>('/api/users', formData);
      if (response.data.success) {
        setUsers([...users, response.data.data.user]);
        setFormData({ username: '', email: '', password: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiClient.delete(`/api/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      setDeleteConfirmId(null);
    } catch (error) {
      // Error handling
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div data-testid="users-page">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          data-testid="users-add-button"
        >
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Create New User</h2>

          {formError && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{formError}</div>}

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="add-user-username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="add-user-email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="add-user-password"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                data-testid="add-user-submit"
              >
                {formLoading ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                data-testid="add-user-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full" data-testid="users-table">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} data-testid={`users-row-${user.id}`}>
                <td className="px-6 py-3 text-sm text-gray-900">{user.username}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-3 text-sm text-gray-900 capitalize">{user.role}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-sm">
                  {deleteConfirmId === user.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Confirm
                      </button>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-gray-600 hover:text-gray-800 font-medium">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(user.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                      data-testid={`users-delete-${user.id}`}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
