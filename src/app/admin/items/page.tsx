'use client';

import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import CedisIcon from '@/components/CedisIcon';

const mockItems = [
  { id: 'SKU001', name: 'Brake Pads Set (Front)', sku: 'BP-F-001', costPrice: '₵12.50', sellPrice: '₵24.99', quantity: 45, category: 'Brakes', status: 'Active' },
  { id: 'SKU002', name: 'Air Filter Premium', sku: 'AF-P-001', costPrice: '₵8.75', sellPrice: '₵19.99', quantity: 8, category: 'Filters', status: 'Low Stock' },
  { id: 'SKU003', name: 'Oil Filter Synthetic', sku: 'OF-S-001', costPrice: '₵5.25', sellPrice: '₵12.99', quantity: 120, category: 'Filters', status: 'Active' },
  { id: 'SKU004', name: 'Spark Plugs (4pc Set)', sku: 'SP-4-001', costPrice: '₵15.00', sellPrice: '₵34.99', quantity: 3, category: 'Ignition', status: 'Critical' },
  { id: 'SKU005', name: 'Radiator Hose Kit', sku: 'RH-K-001', costPrice: '₵18.50', sellPrice: '₵42.99', quantity: 67, category: 'Cooling', status: 'Active' },
];

export default function AdminItemsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Cost Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Sell Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <CedisIcon className="w-3.5 h-3.5" />
                    {item.costPrice}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary-600">
                    <CedisIcon className="w-3.5 h-3.5" />
                    {item.sellPrice}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ?{
                    item.status === 'Active' ? 'bg-green-100 text-green-700' :
                    item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-primary-100 text-primary-700'
                  }`}>
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


