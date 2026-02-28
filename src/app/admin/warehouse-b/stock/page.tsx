'use client';

import { FiEdit2, FiTrash2, FiAlertCircle, FiPlus } from 'react-icons/fi';

const mockStock = [
  { id: 'SKU001', name: 'Brake Pads Set', quantity: 45, location: 'A-01-01', reorderLevel: 20, status: 'Normal' },
  { id: 'SKU002', name: 'Air Filter', quantity: 8, location: 'A-02-05', reorderLevel: 15, status: 'Low' },
  { id: 'SKU003', name: 'Oil Filter', quantity: 120, location: 'A-01-03', reorderLevel: 30, status: 'Normal' },
  { id: 'SKU004', name: 'Spark Plugs (4pc)', quantity: 3, location: 'A-03-02', reorderLevel: 10, status: 'Critical' },
  { id: 'SKU005', name: 'Radiator Hose', quantity: 67, location: 'A-02-01', reorderLevel: 15, status: 'Normal' },
];

export default function StockPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Stock Levels (Warehouse B - Bulk Stock)</h2>
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
          <FiPlus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Reorder Level</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockStock.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.name}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ?{
                    item.status === 'Normal' ? 'bg-green-100 text-green-700' :
                    item.status === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-primary-100 text-primary-700'
                  }`}>
                    {item.status === 'Critical' && <FiAlertCircle className="w-3 h-3" />}
                    {item.status}
                  </span>
                </td>
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


