'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [outsourcedServices, setOutsourcedServices] = useState<any[]>([]);
  const [inventoryOnCredit, setInventoryOnCredit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showOutsourcedPayment, setShowOutsourcedPayment] = useState(false);
  const [showInventoryPayment, setShowInventoryPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState('receptionist');
  const [paymentForm, setPaymentForm] = useState({
    invoice: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [outsourcedPayments, setOutsourcedPayments] = useState<{[key: string]: string}>({});
  const [inventoryPayments, setInventoryPayments] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.user_type || 'receptionist');
      } catch (e) {
        setUserRole('receptionist');
      }
    }
  }, []);

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString()}`;
  };

  const fetchData = async () => {
    try {
      const [paymentsData, invoicesData, outsourcedData, inventoryData] = await Promise.all([
        api.payments.list(),
        api.invoices.list(),
        api.outsourcedServices.list(),
        api.inventory.on_credit ? api.inventory.on_credit() : Promise.resolve([]),
      ]);
      setPayments(paymentsData.results || paymentsData || []);
      setInvoices(invoicesData.results || invoicesData || []);
      // Filter to show only services with unpaid balance
      const unpaidServices = (outsourcedData.results || outsourcedData || []).filter(
        (service: any) => service.payment_status !== 'paid'
      );
      setOutsourcedServices(unpaidServices);
      setInventoryOnCredit(inventoryData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      setShowForm(false);
      setPaymentForm({
        invoice: '',
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

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
        const newPayments = {...prev};
        delete newPayments[serviceId];
        return newPayments;
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

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
        const newPayments = {...prev};
        delete newPayments[itemId];
        return newPayments;
      });
      await fetchData();
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
          <div className="text-xl text-gray-600">Loading payments...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showOutsourcedPayment && (
          <div className="dashboard-section">
            <h3 className="text-base font-bold text-gray-800 mb-4">Outsourced Services Payment</h3>
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
                            [service.id]: e.target.value
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
        )}

        {showInventoryPayment && (
          <div className="dashboard-section">
            <h3 className="text-base font-bold text-gray-800 mb-4">Inventory Supplier Payment</h3>
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
                            [item.id]: e.target.value
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
        )}

        {showForm && (
          <div className="dashboard-section">
            <h3 className="text-base font-bold text-gray-800 mb-4">Record New Payment</h3>
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
        )}

        {payments.length === 0 ? (
          <div className="dashboard-section p-8 text-center text-gray-600">
            No payments recorded yet
          </div>
        ) : (
          <div className="dashboard-table">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Phone</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-sm font-semibold">Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-600">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{payment.customer_name || 'N/A'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{payment.customer_phone || 'N/A'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 font-semibold">{formatCedi(payment.amount)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


