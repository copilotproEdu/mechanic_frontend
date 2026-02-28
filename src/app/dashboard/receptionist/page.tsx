'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { FiClipboard, FiTruck, FiFileText, FiCreditCard } from 'react-icons/fi';

export default function ReceptionistDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Verify user is receptionist
    const user = localStorage.getItem('user');
    if (!user) {
      router.replace('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const userType = userData.user_type || userData.profile?.role;
      
      console.log('Receptionist Dashboard - User type:', userType);
      
      // Validate userType exists
      if (!userType) {
        console.log('No userType found, clearing session and redirecting to login');
        localStorage.clear();
        router.replace('/login');
        return;
      }
      
      if (userType !== 'receptionist') {
        // Redirect to correct dashboard with fallback
        const validRoles = ['ceo', 'manager', 'mechanic', 'receptionist'];
        const targetRole = validRoles.includes(userType) ? userType : 'receptionist';
        console.log('Not receptionist, redirecting to:', `/dashboard/${targetRole}`);
        router.replace(`/dashboard/${targetRole}`);
        return;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      localStorage.clear();
      router.replace('/login');
      return;
    }
  }, [router]);

  return (
    <DashboardLayout userRole="receptionist">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Today&apos;s Check-ins</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Pending Payments</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Awaiting Payment</h3>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/cars/intake">
            <div className="dashboard-section dashboard-card-hover cursor-pointer">
              <FiClipboard className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 mt-3">Car Intake</h3>
              <p className="text-gray-600 text-sm mt-2">Log a new car arrival</p>
            </div>
          </Link>

          <Link href="/cars">
            <div className="dashboard-section dashboard-card-hover cursor-pointer">
              <FiTruck className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 mt-3">Cars</h3>
              <p className="text-gray-600 text-sm mt-2">View all cars in the system</p>
            </div>
          </Link>

          <Link href="/invoices">
            <div className="dashboard-section dashboard-card-hover cursor-pointer">
              <FiFileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 mt-3">Invoices</h3>
              <p className="text-gray-600 text-sm mt-2">Manage invoices and prepare for discharge</p>
            </div>
          </Link>

          <Link href="/payments">
            <div className="dashboard-section dashboard-card-hover cursor-pointer">
              <FiCreditCard className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 mt-3">Payments</h3>
              <p className="text-gray-600 text-sm mt-2">Track and record payments</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
