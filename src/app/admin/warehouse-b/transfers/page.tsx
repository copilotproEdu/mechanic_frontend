'use client';

import { FiArrowRight, FiCheckCircle, FiClock, FiEdit2 } from 'react-icons/fi';

const mockTransfers = [
  { id: 'TRF001', date: '2024-11-15', from: 'A-01-01', to: 'B-02-03', items: 25, product: 'Brake Pads', status: 'Completed' },
  { id: 'TRF002', date: '2024-11-14', from: 'A-02-05', to: 'B-01-04', items: 12, product: 'Air Filters', status: 'Completed' },
  { id: 'TRF003', date: '2024-11-16', from: 'A-03-02', to: 'B-03-01', items: 8, product: 'Spark Plugs', status: 'In Transit' },
  { id: 'TRF004', date: '2024-11-16', from: 'A-01-03', to: 'B-02-02', items: 40, product: 'Oil Filters', status: 'Pending' },
];

export default function TransfersPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inter-Warehouse Transfers</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Transfer #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">From Location</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase"></th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">To Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockTransfers.map((transfer) => (
              <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{transfer.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{transfer.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{transfer.from}</td>
                <td className="px-6 py-4 text-center text-gray-400">
                  <FiArrowRight className="w-4 h-4 mx-auto" />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{transfer.to}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{transfer.product}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{transfer.items}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ?{
                    transfer.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    transfer.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {transfer.status === 'Completed' && <FiCheckCircle className="w-3 h-3" />}
                    {transfer.status === 'In Transit' && <FiArrowRight className="w-3 h-3" />}
                    {transfer.status === 'Pending' && <FiClock className="w-3 h-3" />}
                    {transfer.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


