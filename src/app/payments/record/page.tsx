'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function RecordPaymentPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('receptionist');
  const [paymentForm, setPaymentForm] = useState({
    invoice: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invoicesData = await api.invoices.list();
        setInvoices(invoicesData.results || invoicesData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.payments.create({
        ...paymentForm,
        amount: Number(paymentForm.amount),
      });
      router.push('/payments');
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
          <div className="text-xl text-gray-600">Loading invoices...</div>
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
          <h2 className="text-lg font-bold text-gray-800">Record Payment</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="dashboard-section p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice</label>
                <select
                  value={paymentForm.invoice}
                  onChange={(e) => {
                    const invoice = invoices.find(inv => inv.id === e.target.value);
                    setPaymentForm(prev => ({
                      ...prev,
                      invoice: e.target.value,
                      amount: invoice?.total_amount || '',
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Invoice</option>
                  {invoices.filter(inv => inv.status !== 'paid').map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`} - {invoice.customer_name} - {formatCedi(invoice.total_amount)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₵)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#ffe600] hover:bg-[#f5dc00] disabled:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
            >
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
