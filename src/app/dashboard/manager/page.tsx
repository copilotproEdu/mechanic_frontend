'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function ManagerDashboard() {
    const router = useRouter();

    useEffect(() => {
      // Verify user is manager
      const user = localStorage.getItem('user');
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        const userType = userData.user_type || userData.profile?.role;
      
        console.log('Manager Dashboard - User type:', userType);
      
        if (userType !== 'manager') {
          // Redirect to correct dashboard
          console.log('Not manager, redirecting to:', `/dashboard/${userType || 'receptionist'}`);
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
    <DashboardLayout userRole="manager">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Cars Awaiting Approval</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Cars Ready for Dispatch</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Low Stock Items</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Overdue Payments</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="text-base font-bold text-gray-800 mb-3">Manager Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="dashboard-action">
              Approve Invoices
            </button>
            <button className="dashboard-action">
              Manage Inventory
            </button>
            <button className="dashboard-action">
              Vendor Payments
            </button>
            <button className="dashboard-action">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
