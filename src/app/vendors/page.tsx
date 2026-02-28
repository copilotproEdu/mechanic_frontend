'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('manager');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'manager');
      } catch (e) {
        setUserRole('manager');
      }
    }

    const fetchVendors = async () => {
      try {
        const data = await api.vendors.list();
        setVendors(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading vendors...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            + Add Vendor
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {vendors.length === 0 ? (
          <div className="dashboard-section p-8 text-center text-gray-600">
            No vendors registered yet
          </div>
        ) : (
          <div className="dashboard-table">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Vendor Name</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Contact</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor: any) => (
                  <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-600">{vendor.name}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{vendor.contact_person || 'N/A'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{vendor.email}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 text-primary-600 font-bold">₵{vendor.outstanding_balance || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


