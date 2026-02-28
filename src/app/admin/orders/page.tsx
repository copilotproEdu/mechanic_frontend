'use client';

import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const mockOrders = [
  { id: 'ORD001', date: '2024-11-16', customer: 'ABC Motors', items: 4, total: '?456.78', status: 'Completed', paid: true },
  { id: 'ORD002', date: '2024-11-16', customer: 'XYZ Auto Repair', items: 8, total: '?892.45', status: 'Shipped', paid: true },
  { id: 'ORD003', date: '2024-11-15', customer: 'Local Mechanic', items: 3, total: '?234.50', status: 'Processing', paid: false },
  { id: 'ORD004', date: '2024-11-15', customer: 'Fleet Services', items: 12, total: '?1,245.99', status: 'Completed', paid: true },
  { id: 'ORD005', date: '2024-11-14', customer: 'Premium Auto', items: 6, total: '?567.80', status: 'Pending', paid: false },
];

export default function OrdersPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Sales Orders</h2>
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
          <FiPlus className="w-5 h-5" />
          New Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Order #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Payment</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.items}</td>
                <td className="px-6 py-4 text-sm font-semibold text-primary-600">{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ?{
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ?{
                    order.paid ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {order.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <FiEye className="w-4 h-4" />
                    </button>
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


