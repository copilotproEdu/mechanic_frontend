'use client';

import { useState } from 'react';
import { FiUpload, FiSave } from 'react-icons/fi';

export default function CompanyProfilePage() {
  const [companyData, setCompanyData] = useState({
    id: 'SCHOOL-001',
    name: 'Springfield High School',
    numberOfUsers: 24,
    address: '123 Education Avenue, Springfield, ST 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@springfieldhigh.edu',
  });

  const fillDummyCompany = () => {
    const names = ['Brookfield Academy', 'Riverside School', 'Maple Grove High', 'Sunrise Prep'];
    const addresses = [
      '45 Ridgeview Rd, Accra, GH',
      '12 Coastal Ave, Cape Coast, GH',
      '101 Greenway Blvd, Kumasi, GH',
      '88 Sunrise St, Tema, GH',
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    const users = 18 + Math.floor(Math.random() * 40);
    const phone = `+233 2${Math.floor(100000000 + Math.random() * 900000000)}`;
    const email = `info@${name.toLowerCase().replace(/\s+/g, '')}.edu`;

    setCompanyData({
      id: 'SCHOOL-001',
      name,
      numberOfUsers: users,
      address,
      phone,
      email,
    });
  };

  return (
    <div>
      <div className="card p-6">
        <form className="space-y-6">
          {/* School Logo */}
          <div>
            <label className="label">School Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-gray-400 text-sm">No Logo</span>
              </div>
              <button type="button" className="btn-secondary flex items-center gap-2">
                <FiUpload className="w-4 h-4" />
                Upload Logo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Recommended size: 200x200px, Max file size: 2MB</p>
          </div>

          {/* School ID */}
          <div>
            <label className="label">School ID</label>
            <input
              type="text"
              value={companyData.id}
              disabled
              className="input-field bg-gray-50"
            />
          </div>

          {/* School Name */}
          <div>
            <label className="label">School Name</label>
            <input
              type="text"
              value={companyData.name}
              onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Number of Users */}
          <div>
            <label className="label">Number of Users</label>
            <input
              type="text"
              value={companyData.numberOfUsers}
              disabled
              className="input-field bg-gray-50"
            />
          </div>

          {/* School Address */}
          <div>
            <label className="label">School Address</label>
            <textarea
              value={companyData.address}
              onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
              rows={3}
              className="input-field"
            />
          </div>

          {/* School Phone */}
          <div>
            <label className="label">School Phone</label>
            <input
              type="tel"
              value={companyData.phone}
              onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
              className="input-field"
            />
          </div>

          {/* School Email */}
          <div>
            <label className="label">School Email</label>
            <input
              type="email"
              value={companyData.email}
              onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" className="btn-secondary" onClick={fillDummyCompany}>
              Fill dummy data
            </button>
            <button type="button" className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


