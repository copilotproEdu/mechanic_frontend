'use client';

import { formatDateForInput } from '@/lib/dateUtils';

export default function ConfigurationPage() {
  return (
    <div>
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">System Configuration</h2>
        <p className="text-gray-600 mb-6">Configure system-wide settings and preferences</p>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                <input
                  type="text"
                  defaultValue="EMMILIT PREPARATORY SCHOOL"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School Code</label>
                <input
                  type="text"
                  defaultValue="EPS001"
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-4">Academic Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Term</label>
                <select className="input-field w-full">
                  <option>First Term</option>
                  <option>Second Term</option>
                  <option>Third Term</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select className="input-field w-full">
                  <option>2024/2025</option>
                  <option>2025/2026</option>
                  <option>2023/2024</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-4">Finance Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select className="input-field w-full">
                  <option>GHS (Ghana Cedi)</option>
                  <option>USD (US Dollar)</option>
                  <option>EUR (Euro)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fees Due Date</label>
                <input
                  type="date"
                  defaultValue={formatDateForInput('2024-12-31')}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button className="btn-secondary">Cancel</button>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}


