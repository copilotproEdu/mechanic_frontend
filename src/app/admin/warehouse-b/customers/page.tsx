'use client';

import { FiMail, FiPhone, FiEdit2, FiTrash2 } from 'react-icons/fi';

const mockCustomers = [
  { id: 'CUST001', name: 'ABC Motors', email: 'contact@abcmotors.com', phone: '555-0101', city: 'New York', totalPurchases: '₵5,234' },
  { id: 'CUST002', name: 'XYZ Auto Repair', email: 'info@xyzauto.com', phone: '555-0102', city: 'Los Angeles', totalPurchases: '₵8,945' },
  { id: 'CUST003', name: 'Local Mechanic', email: 'contact@localmech.com', phone: '555-0103', city: 'Chicago', totalPurchases: '₵2,123' },
  { id: 'CUST004', name: 'Fleet Services Inc', email: 'fleet@services.com', phone: '555-0104', city: 'Houston', totalPurchases: '₵12,567' },
  { id: 'CUST005', name: 'Premium Auto Care', email: 'sales@premiumauto.com', phone: '555-0105', city: 'Phoenix', totalPurchases: '₵3,456' },
];

export default function CustomersPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customers</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">City</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total Purchases</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.name}</td>
                <td className="px-6 py-4">
                  <a href={`mailto:${customer.email}`} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <FiMail className="w-3.5 h-3.5" />
                    {customer.email}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <a href={`tel:${customer.phone}`} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <FiPhone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.city}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{customer.totalPurchases}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


