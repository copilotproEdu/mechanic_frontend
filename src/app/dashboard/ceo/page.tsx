'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function CEODashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    // Verify user is CEO
    const user = localStorage.getItem('user');
    if (!user) {
      router.replace('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const userType = userData.user_type || userData.profile?.role;
      
      console.log('CEO Dashboard - User type:', userType);
      
      if (userType !== 'ceo') {
        // Redirect to correct dashboard
        console.log('Not CEO, redirecting to:', `/dashboard/${userType || 'receptionist'}`);
        router.replace(`/dashboard/${userType || 'receptionist'}`);
        return;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      router.replace('/login');
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const [dashboardStats, inventoryStats, financialReport] = await Promise.all([
          api.dashboard.statistics(),
          api.inventory.statistics().catch(() => null),
          api.reports.monthlyFinancial().catch(() => null),
        ]);

        setStats({
          ...dashboardStats,
          inventory_value: inventoryStats?.total_value || 0,
        });
        setMonthlyReport(financialReport);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [paymentsData, invoicesData] = await Promise.all([
          api.payments.list(),
          api.invoices.list(),
        ]);

        const payments = Array.isArray(paymentsData) ? paymentsData : paymentsData?.results || [];
        const invoices = Array.isArray(invoicesData) ? invoicesData : invoicesData?.results || [];

        const transactions = [
          ...payments.map((p: any) => ({
            id: p.id,
            type: 'Payment',
            title: p.customer_name || 'Customer Payment',
            description: p.invoice_number ? `Invoice #${p.invoice_number}` : 'Payment',
            amount: Number(p.amount || 0),
            date: new Date(p.created_at || new Date()).toLocaleDateString(),
            status: p.status || 'completed',
          })),
          ...invoices.map((i: any) => ({
            id: i.id,
            type: 'Invoice',
            title: i.customer_name || 'Customer',
            description: i.car_number_plate ? `${i.car_number_plate}` : `Invoice #${i.invoice_number || i.id}`,
            amount: Number(i.total_amount || i.labor_cost || 0),
            date: new Date(i.created_at || new Date()).toLocaleDateString(),
            status: i.status || 'pending',
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);

        setRecentTransactions(transactions);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userRole="ceo">
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="ceo">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="ceo">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Cars in Shop</h3>
            <p className="text-2xl font-bold text-gray-900 leading-tight">{stats?.in_shop || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Currently being serviced</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Outstanding Customer Debt</h3>
            <p className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">{formatCedi(stats?.outstanding_customer_debt)}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Vendor Credit</h3>
            <p className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">{formatCedi(-(stats?.outstanding_vendor_credit || 0))}</p>
            <p className="text-xs text-gray-500 mt-1">Vendor balances</p>
          </div>

          <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Inventory Value</h3>
            <p className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">{formatCedi(stats?.inventory_value)}</p>
            <p className="text-xs text-gray-500 mt-1">In stock items</p>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="dashboard-section">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Monthly Cashflow</h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Outstanding Invoiced</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatCedi(stats?.total_invoiced_this_month)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Less: Vendor Credit</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatCedi(-(stats?.outstanding_vendor_credit || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Paid This Month</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatCedi(stats?.total_paid_this_month)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-700 font-semibold">Balance</span>
                <span className="text-2xl font-bold text-green-600 tabular-nums">
                  {formatCedi((stats?.total_invoiced_this_month || 0) - (stats?.outstanding_vendor_credit || 0) - (stats?.total_paid_this_month || 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Cars</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats?.total_cars || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Completed This Month</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats?.completed_this_month || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">In Shop</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats?.in_shop || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Outsourced Services Paid</span>
                <span className="text-xl font-bold text-gray-900 tabular-nums">{stats?.outsourced_services_paid || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-section">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={transaction.id || index} className={`flex justify-between items-center px-2 py-2 rounded-lg ${index < recentTransactions.length - 1 ? 'border-b border-gray-100' : ''} text-sm`}>
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.title}</p>
                    <p className="text-xs text-gray-500">{transaction.description}</p>
                  </div>
                  <span className={`font-bold tabular-nums ${transaction.type === 'Payment' ? 'text-green-600' : 'text-primary-600'}`}>
                    {transaction.type === 'Payment' ? '+' : '-'}₵{Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
