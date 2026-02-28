'use client';

import { FiCheckCircle, FiAlertCircle, FiEdit2 } from 'react-icons/fi';

const mockReceiving = [
  { id: 'RCV001', poNumber: 'PO001', supplier: 'Auto Parts Co', items: 15, receivedDate: '2024-11-15', verifiedDate: '2024-11-15', status: 'Verified' },
  { id: 'RCV002', poNumber: 'PO002', supplier: 'Parts Warehouse', items: 8, receivedDate: '2024-11-14', verifiedDate: '2024-11-14', status: 'Verified' },
  { id: 'RCV003', poNumber: 'PO003', supplier: 'Global Auto Supply', items: 22, receivedDate: '2024-11-13', verifiedDate: '???', status: 'Pending' },
  { id: 'RCV004', poNumber: 'PO004', supplier: 'Auto Parts Co', items: 12, receivedDate: '2024-11-16', verifiedDate: '???', status: 'Discrepancy' },
];

export default function ReceivingPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Receiving Dock</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Receipt #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">PO Number</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Supplier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Received Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Verified Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockReceiving.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.poNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.supplier}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.items}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.receivedDate}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.verifiedDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ?{
                    item.status === 'Verified' ? 'bg-green-100 text-green-700' :
                    item.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                    'bg-primary-100 text-primary-700'
                  }`}>
                    {item.status === 'Verified' && <FiCheckCircle className="w-3 h-3" />}
                    {item.status === 'Discrepancy' && <FiAlertCircle className="w-3 h-3" />}
                    {item.status}
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


