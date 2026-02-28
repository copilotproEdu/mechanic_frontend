'use client';

import { FiEye, FiDownload } from 'react-icons/fi';

const mockSales = [
  { id: 'SAL001', date: '2024-11-16', customer: 'ABC Motors', items: 4, amount: '₵456.78', paymentMethod: 'Card', status: 'Completed' },
  { id: 'SAL002', date: '2024-11-16', customer: 'XYZ Auto Repair', items: 8, amount: '₵892.45', paymentMethod: 'Cash', status: 'Completed' },
  { id: 'SAL003', date: '2024-11-15', customer: 'Local Mechanic', items: 3, amount: '₵234.50', paymentMethod: 'Check', status: 'Completed' },
  { id: 'SAL004', date: '2024-11-15', customer: 'Fleet Services', items: 12, amount: '₵1,245.99', paymentMethod: 'Card', status: 'Completed' },
  { id: 'SAL005', date: '2024-11-14', customer: 'DIY Customer', items: 2, amount: '₵125.00', paymentMethod: 'Card', status: 'Refunded' },
];

export default function SalesPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales History</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Sale #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Payment Method</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sale.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sale.customer}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{sale.items}</td>
                <td className="px-6 py-4 text-sm font-semibold text-primary-600">{sale.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sale.paymentMethod}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    sale.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                      <FiDownload className="w-4 h-4" />
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


