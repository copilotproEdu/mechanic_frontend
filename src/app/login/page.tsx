'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/brooks-api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login(username, password);
      
      // Clear any old data first
      localStorage.clear();
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Get user type - check both possible locations
      const userType = response.user.user_type || response.user.profile?.role;
      
      console.log('Login response:', response);
      console.log('User type:', userType);
      
      // Redirect based on user role using replace to prevent back navigation
      if (userType === 'ceo') {
        router.replace('/dashboard/ceo');
      } else if (userType === 'manager') {
        router.replace('/dashboard/manager');
      } else if (userType === 'mechanic') {
        router.replace('/dashboard/mechanic');
      } else {
        router.replace('/dashboard/receptionist');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border border-primary-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 mb-2">AutoShop Pro</h1>
          <p className="text-gray-600">Management System</p>
        </div>

        {error && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
