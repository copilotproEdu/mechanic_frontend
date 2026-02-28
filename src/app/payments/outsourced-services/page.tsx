'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function OutsourcedServicesPaymentPage() {
  const router = useRouter();
  const [outsourcedServices, setOutsourcedServices] = useState<any[]>([]);
  const [outsourcedPayments, setOutsourcedPayments] = useState<{ [key: string]: string }>({});
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

  const fetchServices = async () => {
    try {
      const outsourcedData = await api.outsourcedServices.list();
      const unpaidServices = (outsourcedData.results || outsourcedData || []).filter(
        (service: any) => service.payment_status !== 'paid'
      );
      setOutsourcedServices(unpaidServices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load outsourced service payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOutsourcedPayment = async (serviceId: string) => {
    const amount = outsourcedPayments[serviceId];
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.outsourcedServices.makePayment(serviceId, Number(amount));
      setOutsourcedPayments(prev => {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      });
      await fetchServices();
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
          <div className="text-xl text-gray-600">Loading outsourced payments...</div>
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
          <h2 className="text-lg font-bold text-gray-800">Outsourced Services Payment</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="dashboard-section p-6">
          {outsourcedServices.length === 0 ? (
            <p className="text-gray-600">No unpaid outsourced services</p>
          ) : (
            <div className="space-y-3">
              {outsourcedServices.map((service: any) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg ${service.payment_status === 'paid' ? 'bg-gray-50 line-through opacity-50' : 'bg-white'}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-500">Vendor</span>
                      <p className="font-semibold">{service.vendor_company_name || service.vendor_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Service</span>
                      <p className="font-semibold">{service.service_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Owed</span>
                      <p className="font-semibold text-primary-600">{formatCedi(service.total_cost)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Amount Paid</span>
                      <p className="font-semibold text-green-600">{formatCedi(service.amount_paid)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Remaining</span>
                      <p className="font-semibold text-orange-600">{formatCedi(service.remaining_balance)}</p>
                    </div>
                  </div>
                  {service.payment_status !== 'paid' && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="number"
                        min="0"
                        max={service.remaining_balance}
                        step="0.01"
                        placeholder="Enter payment amount"
                        value={outsourcedPayments[service.id] || ''}
                        onChange={(e) => setOutsourcedPayments(prev => ({
                          ...prev,
                          [service.id]: e.target.value,
                        }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <button
                        onClick={() => handleOutsourcedPayment(service.id)}
                        disabled={submitting || !outsourcedPayments[service.id]}
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
