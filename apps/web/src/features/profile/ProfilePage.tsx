import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiClient, handleApiError } from '../../lib/api';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: number;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get<any>('/api/profile');
        if (response.data.success && response.data.data) {
          setProfile(response.data.data);
        }
      } catch (error) {
        await handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Failed to load profile</div>;
  }

  const createdDate = new Date(profile.createdAt).toLocaleDateString();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Username</label>
            <p className="text-lg text-gray-900" data-testid="profile-username">
              {profile.username}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <p className="text-lg text-gray-900" data-testid="profile-email">
              {profile.email}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Role</label>
            <p className="text-lg text-gray-900" data-testid="profile-role">
              {profile.role}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Account Created</label>
            <p className="text-lg text-gray-900" data-testid="profile-created-at">
              {createdDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
