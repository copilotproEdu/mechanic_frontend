'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiUser, FiTrash2, FiGrid, FiList, FiCalendar } from 'react-icons/fi';

const mockItems = [
  { id: '65998', productCode: '36063', productName: 'Acer Predator Triton 500', specialInstructions: '???', date: '05 Jun 2020', quantity: 65, status: 'In progress' },
  { id: '63780', productCode: '74527-2137', productName: 'Asus ROG Zephyrus S GX701', specialInstructions: '???', date: '13 Jun 2020', quantity: 12, status: 'In progress' },
  { id: '87560', productCode: '16880', productName: 'Asus ROG Zephyrus S GX531', specialInstructions: '???', date: '10 Oct 2020', quantity: 34, status: 'In progress' },
  { id: '00701', productCode: '59970', productName: 'Dell Strix Scar II GL704GW', specialInstructions: '???', date: '21 Dec 2020', quantity: 43, status: 'Completed' },
  { id: '71956', productCode: '06485-9040', productName: 'Dell Strix Scar II GL504GW', specialInstructions: '???', date: '23 Jun 2020', quantity: 11, status: 'Completed' },
  { id: '16992', productCode: '74216', productName: 'Dell G5 15', specialInstructions: '???', date: '19 Aug 2020', quantity: 15, status: 'In progress' },
  { id: '73292', productCode: '48518-2344', productName: 'HP Omen 15', specialInstructions: '???', date: '14 Jan 2020', quantity: 9, status: 'Completed' },
  { id: '44410', productCode: '83450', productName: 'Gigabyte Aorus 15-W9', specialInstructions: '???', date: '24 Jun 2020', quantity: 21, status: 'Completed' },
  { id: '10400', productCode: '03624-4637', productName: 'Lenovo Legion Y540-15', specialInstructions: '???', date: '25 May 2020', quantity: 18, status: 'In progress' },
  { id: '81035', productCode: '90833-8219', productName: 'MSI GS65 Stealth 8RD', specialInstructions: '???', date: '23 Aug 2020', quantity: 12, status: 'In progress' },
  { id: '31926', productCode: '26624', productName: 'MSI GL63 8SF', specialInstructions: '???', date: '10 Feb 2020', quantity: 7, status: 'In progress' },
  { id: '45501', productCode: '32673-4110', productName: 'Samsung Notebook Odyssey', specialInstructions: '???', date: '22 Aug 2020', quantity: 5, status: 'In progress' },
  { id: '56697', productCode: '94012-6762', productName: 'Lenovo Legion Y540-15', specialInstructions: '???', date: '05 Jan 2020', quantity: 10, status: 'Completed' },
];

export default function ItemsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ?{viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ?{viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status</span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>All</option>
                <option>In progress</option>
                <option>Completed</option>
              </select>
            </div>

            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded">
              <FiCalendar className="w-5 h-5" />
            </button>

            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <FiPlus className="w-5 h-5" />
              Add Items
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Special instructions</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.productCode}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.specialInstructions}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ?{
                    item.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <FiUser className="w-4 h-4" />
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">??</button>
          <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded">1</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">2</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">3</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">...</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">??</button>
        </div>
      </div>
    </div>
  );
}
