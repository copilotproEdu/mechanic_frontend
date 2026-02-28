'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Integration } from '@/types';
import { FiPlus, FiShoppingCart, FiTruck, FiCreditCard, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Shopify',
    type: 'ecommerce',
    status: 'active',
  },
  {
    id: '2',
    name: 'Stripe',
    type: 'payment',
    status: 'active',
  },
  {
    id: '3',
    name: 'FedEx',
    type: 'shipping',
    status: 'active',
  },
  {
    id: '4',
    name: 'Amazon',
    type: 'ecommerce',
    status: 'inactive',
  },
];

export default function IntegrationsPage() {
  const [integrations] = useState<Integration[]>(mockIntegrations);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ecommerce':
        return <FiShoppingCart className="w-8 h-8" />;
      case 'payment':
        return <FiCreditCard className="w-8 h-8" />;
      case 'shipping':
        return <FiTruck className="w-8 h-8" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-end">
        <button className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                  {getIcon(integration.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{integration.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{integration.type}</p>
                </div>
              </div>
              {integration.status === 'active' ? (
                <FiToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <FiToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ?{
                integration.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {integration.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
