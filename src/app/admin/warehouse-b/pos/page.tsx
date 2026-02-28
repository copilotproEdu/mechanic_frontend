'use client';

import { FiShoppingCart, FiX, FiSave } from 'react-icons/fi';

const mockPOS = [
  { id: 'TXN001', time: '14:30', customer: 'John Doe', items: 3, total: '₵145.50', status: 'Completed' },
  { id: 'TXN002', time: '14:45', customer: 'Sarah Smith', items: 5, total: '₵287.99', status: 'Completed' },
  { id: 'TXN003', time: '15:00', customer: 'Mike Johnson', items: 2, total: '₵89.99', status: 'Pending' },
  { id: 'TXN004', time: '15:15', customer: 'Walk-in', items: 1, total: '₵45.00', status: 'Completed' },
];

export default function POSPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Point of Sale</h2>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Today&apos;s Sales</div>
          <div className="text-2xl font-bold text-gray-900">₵1,568.48</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Transactions</div>
          <div className="text-2xl font-bold text-gray-900">24</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Avg Transaction</div>
          <div className="text-2xl font-bold text-gray-900">₵65.35</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Transaction #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockPOS.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{txn.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{txn.time}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{txn.customer}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{txn.items}</td>
                <td className="px-6 py-4 text-sm font-semibold text-primary-600">{txn.total}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {txn.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <FiShoppingCart className="w-4 h-4" />
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


