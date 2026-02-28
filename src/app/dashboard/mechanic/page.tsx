'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function MechanicDashboard() {
    const router = useRouter();

    useEffect(() => {
      // Verify user is mechanic
      const user = localStorage.getItem('user');
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        const userType = userData.user_type || userData.profile?.role;
      
        console.log('Mechanic Dashboard - User type:', userType);
      
        if (userType !== 'mechanic') {
          // Redirect to correct dashboard
          console.log('Not mechanic, redirecting to:', `/dashboard/${userType || 'receptionist'}`);
          router.replace(`/dashboard/${userType || 'receptionist'}`);
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        router.replace('/login');
        return;
      }
    }, [router]);

  return (
    <DashboardLayout userRole="mechanic">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Assigned Cars</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Completed This Week</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Awaiting Diagnostics</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="text-base font-bold text-gray-800 mb-3">Mechanic Tasks</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Review assigned car diagnostics</li>
            <li>• Assign parts and inventory items</li>
            <li>• Update repair progress</li>
            <li>• Add outsourced services when needed</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
