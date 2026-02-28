'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function DiagnosticsPage() {
  const [userRole, setUserRole] = useState('mechanic');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'mechanic');
      } catch (e) {
        setUserRole('mechanic');
      }
    }
  }, []);

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-600">
          <p className="text-lg">Diagnostics management coming soon</p>
          <p className="text-sm mt-2">Select a car from the car list to add diagnostics</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

