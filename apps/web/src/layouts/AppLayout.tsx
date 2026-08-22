import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Stock Research</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                data-testid="logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            <a
              href="/dashboard"
              className="block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              data-testid="navigation-dashboard"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              data-testid="navigation-profile"
            >
              Profile
            </a>

            {user?.role === 'admin' && (
              <>
                <div className="my-4 border-t"></div>
                <div className="text-xs font-semibold text-gray-500 px-4 py-2">ADMIN</div>
                <a
                  href="/users"
                  className="block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  data-testid="navigation-users"
                >
                  User Management
                </a>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
