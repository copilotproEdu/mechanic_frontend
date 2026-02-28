'use client';

import { useState } from 'react';
import { FiX, FiLock, FiAlertCircle } from 'react-icons/fi';
import { api } from '@/lib/api';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
  userRole?: string;
}

export default function PasswordChangeModal({ isOpen, onClose, isFirstTime = false, userRole }: PasswordChangeModalProps) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.new_password !== formData.new_password_confirm) {
      setError('New passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await api.users.changePassword(formData);
      
      alert('Password changed successfully! Please log in again with your new password.');
      
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <FiLock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isFirstTime ? 'Set Your Password' : 'Change Password'}
              </h3>
              <p className="text-sm text-gray-500">
                {isFirstTime ? 'Please set a new secure password' : 'Update your account password'}
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {isFirstTime && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">First Time Login</p>
                <p>You must change your password before accessing the system. Your default password was: <strong>emmilit123</strong></p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}
          
          {!isFirstTime && (
            <div className="mb-4">
              <label className="label">Current Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  value={formData.old_password}
                  onChange={(e) => setFormData({...formData, old_password: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="label">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                className="input-field pl-10"
                placeholder="At least 6 characters"
                value={formData.new_password}
                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                className="input-field pl-10"
                placeholder="Re-enter new password"
                value={formData.new_password_confirm}
                onChange={(e) => setFormData({...formData, new_password_confirm: e.target.value})}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>

          {isFirstTime && (
            <p className="mt-4 text-xs text-center text-gray-500">
              You cannot skip this step. A secure password is required to continue.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
