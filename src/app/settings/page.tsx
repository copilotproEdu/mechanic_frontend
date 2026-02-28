'use client';

import { useState, useEffect, FormEvent } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function SettingsPage() {
  const [userRole, setUserRole] = useState('ceo');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    business_name: 'AutoShop Pro',
    business_email: 'info@autoshoppro.com',
    business_phone: '+233 XX XXX XXXX',
    bank_account: 'XXX-XXXXX-XX',
    default_markup: '20',
    labor_rate: '50',
    tax_rate: '0',
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

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('business_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings');
      }
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Save to localStorage
      localStorage.setItem('business_settings', JSON.stringify(settings));
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

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
                    value={settings.business_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, business_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                  <input 
                    type="email" 
                    value={settings.business_email}
                    onChange={(e) => setSettings(prev => ({ ...prev, business_email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                  <input 
                    type="tel" 
                    value={settings.business_phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, business_phone: e.target.value }))}
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
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-800 mb-4">Pricing Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Markup (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.1"
                    value={settings.default_markup}
                    onChange={(e) => setSettings(prev => ({ ...prev, default_markup: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Labor Rate (₵/hour)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={settings.labor_rate}
                    onChange={(e) => setSettings(prev => ({ ...prev, labor_rate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.1"
                    value={settings.tax_rate}
                    onChange={(e) => setSettings(prev => ({ ...prev, tax_rate: e.target.value }))}
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
                onClick={() => window.location.reload()}
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


