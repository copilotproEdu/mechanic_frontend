'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('receptionist');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'receptionist');
      } catch (e) {
        setUserRole('receptionist');
      }
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.notifications.list();
        const items = data?.results || data || [];
        setNotifications(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    // Note: Backend is read-only, so we only update client-side
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    // Note: Backend is read-only, so we only update client-side
  };

  const normalizeType = (notification: any) => {
    const raw = notification.type || notification.notification_type || notification.level || 'info';
    return String(raw).toLowerCase();
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      warning: 'border-yellow-500 bg-yellow-50',
      success: 'border-green-500 bg-green-50',
      error: 'border-red-500 bg-red-50',
      info: 'border-blue-500 bg-blue-50',
    };
    return colors[type] || 'border-gray-300 bg-gray-50';
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-2 rounded-lg text-sm"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="dashboard-section p-8 text-center text-gray-600">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`dashboard-card dashboard-card-hover p-4 border-l-2 cursor-pointer transition ${
                  notification.read
                    ? 'bg-gray-50 border-gray-300'
                    : getNotificationColor(normalizeType(notification))
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{notification.title}</h3>
                      <span className="text-[10px] uppercase tracking-wide text-gray-500">
                        {normalizeType(notification)}
                      </span>
                      {!notification.read && (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
