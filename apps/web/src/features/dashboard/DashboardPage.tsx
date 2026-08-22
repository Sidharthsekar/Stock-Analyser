import React from 'react';
import { useAuth } from '../auth/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div data-testid="dashboard-welcome">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.username}</h1>
      <p className="text-gray-700">Stock research features will be available here.</p>
    </div>
  );
};
