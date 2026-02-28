'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function InventorySupplierPaymentPage() {
  const router = useRouter();
  const [inventoryOnCredit, setInventoryOnCredit] = useState<any[]>([]);
  const [inventoryPayments, setInventoryPayments] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('receptionist');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'receptionist');
      } catch {
        setUserRole('receptionist');
      }
    }
  }, []);

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString()}`;
  };

  const fetchInventory = async () => {
    try {
      const inventoryData = await api.inventory.on_credit();
      setInventoryOnCredit(inventoryData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory credit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInventoryPayment = async (itemId: string) => {
    const amount = inventoryPayments[itemId];
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.inventory.pay_credit(itemId, Number(amount));
      setInventoryPayments(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
      await fetchInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading inventory payments...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/payments')}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Payments
          </button>
          <h2 className="text-lg font-bold text-gray-800">Inventory Supplier Payment</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="dashboard-section p-6">
          {inventoryOnCredit.length === 0 ? (
            <p className="text-gray-600">No inventory items on credit</p>
          ) : (
            <div className="space-y-3">
              {inventoryOnCredit.map((item: any) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg ${!item.is_on_credit ? 'bg-gray-50 line-through opacity-50' : 'bg-white'}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-500">Item</span>
                      <p className="font-semibold">{item.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Supplier</span>
                      <p className="font-semibold text-sm">{item.supplier_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Owed</span>
                      <p className="font-semibold text-primary-600">{formatCedi(item.credit_amount)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Amount Paid</span>
                      <p className="font-semibold text-green-600">{formatCedi(item.amount_paid || 0)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Remaining</span>
                      <p className="font-semibold text-orange-600">{formatCedi(item.remaining_credit || item.credit_amount)}</p>
                    </div>
                  </div>
                  {item.is_on_credit && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="number"
                        min="0"
                        max={item.remaining_credit || item.credit_amount}
                        step="0.01"
                        placeholder="Enter payment amount"
                        value={inventoryPayments[item.id] || ''}
                        onChange={(e) => setInventoryPayments(prev => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <button
                        onClick={() => handleInventoryPayment(item.id)}
                        disabled={submitting || !inventoryPayments[item.id]}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                      >
                        Pay
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
