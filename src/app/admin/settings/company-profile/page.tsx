'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FiUpload, FiSave } from 'react-icons/fi';
import { api } from '@/lib/brooks-api';

export default function CompanyProfilePage() {
  const [companyData, setCompanyData] = useState({
    id: '',
    name: '',
    numberOfUsers: 0,
    address: '',
    phone: '',
    email: '',
    bank_name: '',
    bank_account: '',
    mobile_money_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.settings.get();
        setCompanyData({
          id: data.id || '',
          name: data.company_name || '',
          numberOfUsers: 0,
          address: data.company_address || '',
          phone: data.company_phone || '',
          email: data.company_email || '',
          bank_name: data.bank_name || '',
          bank_account: data.bank_account || '',
          mobile_money_number: data.mobile_money_number || '',
        });
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyData.id) {
      setMessage('Settings ID not found');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await api.settings.update(companyData.id, {
        company_name: companyData.name,
        company_email: companyData.email,
        company_phone: companyData.phone,
        company_address: companyData.address,
        bank_name: companyData.bank_name,
        bank_account: companyData.bank_account,
        mobile_money_number: companyData.mobile_money_number,
      });
      setMessage('Profile saved successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

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
      id: companyData.id,
      name,
      numberOfUsers: users,
      address,
      phone,
      email,
      bank_name: 'Sample Bank Ghana',
      bank_account: '1234567890',
      mobile_money_number: '0240000000',
    });
  };

  if (loading) {
    return <div className="card p-6">Loading profile...</div>;
  }

  return (
    <div>
      <div className="card p-6">
        <form className="space-y-6" onSubmit={handleSave}>
          {message && (
            <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">{message}</div>
          )}
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
            <label className="label">Settings ID</label>
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
            <label className="label">Business Address</label>
            <textarea
              value={companyData.address}
              onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
              rows={3}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Bank Name</label>
            <input
              type="text"
              value={companyData.bank_name}
              onChange={(e) => setCompanyData({ ...companyData, bank_name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Bank Account</label>
            <input
              type="text"
              value={companyData.bank_account}
              onChange={(e) => setCompanyData({ ...companyData, bank_account: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Mobile Money Number</label>
            <input
              type="text"
              value={companyData.mobile_money_number}
              onChange={(e) => setCompanyData({ ...companyData, mobile_money_number: e.target.value })}
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
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


