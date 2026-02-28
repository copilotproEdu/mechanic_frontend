'use client';

import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const mockLocations = [
  { id: 'A-01-01', zone: 'Zone A', aisle: 1, rack: 1, shelf: 1, capacity: 100, current: 45, utilization: '45%' },
  { id: 'A-01-02', zone: 'Zone A', aisle: 1, rack: 1, shelf: 2, capacity: 100, current: 78, utilization: '78%' },
  { id: 'A-02-01', zone: 'Zone A', aisle: 2, rack: 1, shelf: 1, capacity: 80, current: 67, utilization: '84%' },
  { id: 'A-02-05', zone: 'Zone A', aisle: 2, rack: 2, shelf: 5, capacity: 60, current: 8, utilization: '13%' },
  { id: 'A-03-02', zone: 'Zone A', aisle: 3, rack: 2, shelf: 2, capacity: 100, current: 3, utilization: '3%' },
];

export default function LocationsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Locations</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Zone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Aisle</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Rack</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Shelf</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Capacity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Current</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Utilization</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockLocations.map((loc) => (
              <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{loc.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.zone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.aisle}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.rack}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.shelf}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.capacity}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{loc.current}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: loc.utilization }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{loc.utilization}</span>
                  </div>
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


