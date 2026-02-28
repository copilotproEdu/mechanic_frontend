'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';
import Link from 'next/link';

export default function CarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await api.cars.list();
        const carsList = data.results || [];
        setCars(carsList);
        setFilteredCars(carsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCars(cars);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = cars.filter(car => 
        car.customer_name?.toLowerCase().includes(query) ||
        car.number_plate?.toLowerCase().includes(query) ||
        car.make?.toLowerCase().includes(query) ||
        car.model?.toLowerCase().includes(query)
      );
      setFilteredCars(filtered);
    }
  }, [searchQuery, cars]);

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading cars...</div>
        </div>
      </DashboardLayout>
    );
  }

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'dispatched': 'bg-purple-100 text-purple-800',
      'awaiting_payment': 'bg-orange-100 text-orange-800',
      'reopened': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/receptionist')}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back
          </button>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-sm relative">
            <input
              type="text"
              placeholder="Search cars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200"
            />
            <svg
              className="absolute left-2.5 top-2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <Link href="/cars/intake">
            <button className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors">
              + New Car
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {filteredCars.length === 0 ? (
          <div className="dashboard-section p-6 text-center text-gray-600 text-sm">
            {searchQuery ? 'No cars found matching your search.' : 'No cars found. '}
            {!searchQuery && <Link href="/cars/intake" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Create the first entry</Link>}
          </div>
        ) : (
          <div className="dashboard-table">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Plate</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Make/Model</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car: any) => (
                  <tr key={car.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{car.number_plate}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">
                      {car.make} {car.model}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">
                      {car.customer_name || 'N/A'}
                    </td>
                    <td className="px-4 py-2.5 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(car.status)}`}>
                        {car.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm">
                      <Link href={`/cars/${car.id}`}>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">View Details</button>
                      </Link>
                    </td>
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
