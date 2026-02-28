'use client';

import { FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const mockWarehouseBStock = [
  { id: 'SKU001', name: 'Brake Pads Set', quantity: 67, shelf: 'B-01-02', reorderLevel: 20, status: 'Normal' },
  { id: 'SKU002', name: 'Air Filter', quantity: 34, shelf: 'B-02-01', reorderLevel: 15, status: 'Normal' },
  { id: 'SKU003', name: 'Oil Filter', quantity: 5, shelf: 'B-01-05', reorderLevel: 30, status: 'Critical' },
  { id: 'SKU004', name: 'Spark Plugs (4pc)', quantity: 89, shelf: 'B-03-03', reorderLevel: 10, status: 'Normal' },
  { id: 'SKU005', name: 'Radiator Hose', quantity: 12, shelf: 'B-02-04', reorderLevel: 15, status: 'Low' },
];

export default function WarehouseBStockPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Levels (Warehouse B)</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Shelf</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Reorder Level</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockWarehouseBStock.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.name}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.shelf}</td>
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


