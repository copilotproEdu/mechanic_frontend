'use client';

import { FiClock, FiUser, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const mockAuditLog = [
  { id: 1, timestamp: '2024-11-16 14:30:45', user: 'admin@warehouse.com', action: 'Created PO', resource: 'PO001', details: 'Purchase Order created', severity: 'info' },
  { id: 2, timestamp: '2024-11-16 14:25:12', user: 'warehouse@warehouse.com', action: 'Stock Updated', resource: 'SKU001', details: 'Quantity adjusted', severity: 'info' },
  { id: 3, timestamp: '2024-11-16 14:15:33', user: 'manager@warehouse.com', action: 'User Login', resource: 'User Session', details: 'Admin login from IP 192.168.1.100', severity: 'info' },
  { id: 4, timestamp: '2024-11-16 14:05:22', user: 'admin@warehouse.com', action: 'Deleted Item', resource: 'SKU045', details: 'Obsolete product removed', severity: 'warning' },
  { id: 5, timestamp: '2024-11-16 13:55:11', user: 'warehouse@warehouse.com', action: 'Transfer Completed', resource: 'TRF001', details: 'Stock transfer A to B verified', severity: 'info' },
  { id: 6, timestamp: '2024-11-16 13:45:00', user: 'admin@warehouse.com', action: 'Settings Changed', resource: 'System Config', details: 'Reorder levels updated', severity: 'warning' },
];

export default function AuditTrailPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Timestamp</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Resource</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Severity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockAuditLog.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiClock className="w-3.5 h-3.5" />
                    {log.timestamp}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiUser className="w-3.5 h-3.5" />
                    {log.user}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium">{log.resource}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    log.severity === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <FiEye className="w-4 h-4" />
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


