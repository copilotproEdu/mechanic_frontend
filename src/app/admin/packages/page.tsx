'use client';

import { FiTruck, FiCheckCircle, FiAlertCircle, FiEye, FiEdit2 } from 'react-icons/fi';

const mockPackages = [
  { id: 'PKG001', order: 'ORD001', trackingNo: 'TRK123456789', carrier: 'FedEx', status: 'Delivered', date: '2024-11-16', weight: '5.2 lbs' },
  { id: 'PKG002', order: 'ORD002', trackingNo: 'TRK987654321', carrier: 'UPS', status: 'In Transit', date: '2024-11-15', weight: '12.8 lbs' },
  { id: 'PKG003', order: 'ORD003', trackingNo: 'TRK456789123', carrier: 'DHL', status: 'Pending', date: '2024-11-15', weight: '3.1 lbs' },
  { id: 'PKG004', order: 'ORD004', trackingNo: 'TRK789123456', carrier: 'FedEx', status: 'Delivered', date: '2024-11-14', weight: '18.5 lbs' },
  { id: 'PKG005', order: 'ORD005', trackingNo: 'TRK321654987', carrier: 'UPS', status: 'Exception', date: '2024-11-14', weight: '7.3 lbs' },
];

export default function PackagesPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Shipments & Packages</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Package #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Order #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Tracking #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Carrier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Weight</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockPackages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{pkg.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{pkg.order}</td>
                <td className="px-6 py-4 text-sm font-mono text-blue-600">{pkg.trackingNo}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{pkg.carrier}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{pkg.weight}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{pkg.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ?{
                    pkg.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    pkg.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    pkg.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-primary-100 text-primary-700'
                  }`}>
                    {pkg.status === 'Delivered' && <FiCheckCircle className="w-3 h-3" />}
                    {pkg.status === 'Exception' && <FiAlertCircle className="w-3 h-3" />}
                    {pkg.status === 'In Transit' && <FiTruck className="w-3 h-3" />}
                    {pkg.status}
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


