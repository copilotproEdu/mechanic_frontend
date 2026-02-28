'use client';

import { FiToggleRight, FiToggleLeft, FiSettings, FiLink2 } from 'react-icons/fi';

const mockIntegrations = [
  { id: 1, name: 'QuickBooks', category: 'Accounting', status: 'Connected', lastSync: '2024-11-16 10:30 AM', icon: '????' },
  { id: 2, name: 'Shopify', category: 'E-commerce', status: 'Connected', lastSync: '2024-11-16 09:15 AM', icon: '???????' },
  { id: 3, name: 'Stripe', category: 'Payment', status: 'Connected', lastSync: '2024-11-16 11:00 AM', icon: '????' },
  { id: 4, name: 'Google Analytics', category: 'Analytics', status: 'Disconnected', lastSync: '???', icon: '????' },
  { id: 5, name: 'Slack', category: 'Communication', status: 'Connected', lastSync: '2024-11-16 08:45 AM', icon: '????' },
];

export default function IntegrationsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Integrations</h2>
        <p className="text-sm text-gray-600">Connect external services to enhance your warehouse management</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockIntegrations.map((integration) => (
          <div key={integration.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{integration.icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
                <p className="text-xs text-gray-600">{integration.category}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {integration.status === 'Connected' ? (
                    <>Last sync: {integration.lastSync}</>
                  ) : (
                    <>Not connected</>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ?{
                integration.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {integration.status === 'Connected' ? (
                  <FiToggleRight className="w-4 h-4" />
                ) : (
                  <FiToggleLeft className="w-4 h-4" />
                )}
                {integration.status}
              </span>
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                <FiSettings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Available Integrations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Xero', 'FreshBooks', 'Zapier', 'Microsoft Teams', 'Email', 'SMS', 'Accounting', 'HR'].map((app, idx) => (
            <button key={idx} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group">
              <FiLink2 className="w-5 h-5 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
              <div className="text-xs font-medium text-gray-700 text-center">{app}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


