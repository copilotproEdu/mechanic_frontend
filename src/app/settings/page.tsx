'use client';

import { useState, useEffect, FormEvent } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function SettingsPage() {
  const [userRole, setUserRole] = useState('ceo');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    id: '',
    company_name: 'AutoShop Pro',
    company_email: '',
    company_phone: '',
    company_address: '',
    bank_name: '',
    bank_account: '',
    mobile_money_number: '',
    default_tax_percentage: '0',
    default_labor_cost: '0',
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'ceo');
      } catch (e) {
        setUserRole('ceo');
      }
    }

    const loadSettings = async () => {
      try {
        const data = await api.settings.get();
        if (data) {
          setSettings({
            id: data.id || '',
            company_name: data.company_name || '',
            company_email: data.company_email || '',
            company_phone: data.company_phone || '',
            company_address: data.company_address || '',
            bank_name: data.bank_name || '',
            bank_account: data.bank_account || '',
            mobile_money_number: data.mobile_money_number || '',
            default_tax_percentage: String(data.default_tax_percentage ?? '0'),
            default_labor_cost: String(data.default_labor_cost ?? '0'),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!settings.id) {
        throw new Error('Settings record not found');
      }

      await api.settings.update(settings.id, {
        company_name: settings.company_name,
        company_email: settings.company_email,
        company_phone: settings.company_phone,
        company_address: settings.company_address,
        bank_name: settings.bank_name,
        bank_account: settings.bank_account,
        mobile_money_number: settings.mobile_money_number,
        default_tax_percentage: Number(settings.default_tax_percentage || 0),
        default_labor_cost: Number(settings.default_labor_cost || 0),
      });

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-gray-600">Loading settings...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input 
                    type="text" 
                    value={settings.company_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                  <input 
                    type="email" 
                    value={settings.company_email}
                    onChange={(e) => setSettings(prev => ({ ...prev, company_email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                  <input 
                    type="tel" 
                    value={settings.company_phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, company_phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input 
                    type="text" 
                    value={settings.bank_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <input 
                    type="text" 
                    value={settings.bank_account}
                    onChange={(e) => setSettings(prev => ({ ...prev, bank_account: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
                  <input 
                    type="text" 
                    value={settings.mobile_money_number}
                    onChange={(e) => setSettings(prev => ({ ...prev, mobile_money_number: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                  <textarea
                    value={settings.company_address}
                    onChange={(e) => setSettings(prev => ({ ...prev, company_address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-800 mb-4">Pricing Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.1"
                    value={settings.default_tax_percentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, default_tax_percentage: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Labor Cost (₵)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={settings.default_labor_cost}
                    onChange={(e) => setSettings(prev => ({ ...prev, default_labor_cost: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                disabled={submitting}
                className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
              >
                {submitting ? 'Saving...' : 'Save Settings'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setSuccess('');
                  setError('');
                  setLoading(true);
                  api.settings.get().then((data) => {
                    setSettings({
                      id: data.id || '',
                      company_name: data.company_name || '',
                      company_email: data.company_email || '',
                      company_phone: data.company_phone || '',
                      company_address: data.company_address || '',
                      bank_name: data.bank_name || '',
                      bank_account: data.bank_account || '',
                      mobile_money_number: data.mobile_money_number || '',
                      default_tax_percentage: String(data.default_tax_percentage ?? '0'),
                      default_labor_cost: String(data.default_labor_cost ?? '0'),
                    });
                  }).catch((err) => {
                    setError(err instanceof Error ? err.message : 'Failed to reload settings');
                  }).finally(() => setLoading(false));
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}


