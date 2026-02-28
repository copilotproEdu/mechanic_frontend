'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/brooks-api';

export default function ReportsPage() {
  const [userRole, setUserRole] = useState('ceo');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [inventoryUsage, setInventoryUsage] = useState<any>(null);
  const [routineServices, setRoutineServices] = useState<any>(null);
  const [customerDebt, setCustomerDebt] = useState<any>(null);
  const [vendorPayments, setVendorPayments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [financialMonths, setFinancialMonths] = useState({ start: '', end: '' });
  const [inventoryMonths, setInventoryMonths] = useState({ start: '', end: '' });
  const [routineMonths, setRoutineMonths] = useState({ start: '', end: '' });
  const [debtMonths, setDebtMonths] = useState({ start: '', end: '' });
  const [vendorMonths, setVendorMonths] = useState({ start: '', end: '' });
  const [inventoryDaysLabel, setInventoryDaysLabel] = useState('Last 30 Days');

  const formatCedi = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `₵${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const parseMonthInput = (value: string) => {
    if (!value) return null;
    const [year, month] = value.split('-').map(Number);
    if (!year || !month) return null;
    return { year, month };
  };

  const resolveMonthRange = (startValue: string, endValue: string) => {
    const start = parseMonthInput(startValue || endValue);
    const end = parseMonthInput(endValue || startValue);
    if (!start || !end) return null;

    const startDate = new Date(start.year, start.month - 1, 1);
    const endDate = new Date(end.year, end.month, 0, 23, 59, 59, 999);
    return { startDate, endDate, start, end };
  };

  const buildMonthRange = (start: { year: number; month: number }, end: { year: number; month: number }) => {
    const months: Array<{ year: number; month: number }> = [];
    let currentYear = start.year;
    let currentMonth = start.month;

    while (currentYear < end.year || (currentYear === end.year && currentMonth <= end.month)) {
      months.push({ year: currentYear, month: currentMonth });
      currentMonth += 1;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }
    }

    return months;
  };

  const isDateInRange = (value: string | null | undefined, range: { startDate: Date; endDate: Date } | null) => {
    if (!range || !value) return true;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return true;
    return date >= range.startDate && date <= range.endDate;
  };

  const aggregateMonthlyReports = (reports: any[]) => {
    const validReports = reports.filter(Boolean);
    if (!validReports.length) return null;

    const sum = (getter: (item: any) => number) =>
      validReports.reduce((total, item) => total + Number(getter(item) || 0), 0);

    return {
      inflows: {
        total_invoiced: sum((item) => item.inflows?.total_invoiced),
        total_payments: sum((item) => item.inflows?.total_payments),
      },
      expenditures: {
        inventory_purchases: sum((item) => item.expenditures?.inventory_purchases),
        outsourced_costs: sum((item) => item.expenditures?.outsourced_costs),
        total: sum((item) => item.expenditures?.total),
      },
      profit_loss: sum((item) => item.profit_loss),
      operations: {
        cars_received: sum((item) => item.operations?.cars_received),
        cars_completed: sum((item) => item.operations?.cars_completed),
        routine_services: sum((item) => item.operations?.routine_services),
        routine_service_revenue: sum((item) => item.operations?.routine_service_revenue),
      },
    };
  };

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

    const fetchMonthlyFinancial = async () => {
      return api.reports.monthlyFinancial().catch(() => null);
    };

    const fetchInventoryUsage = async () => {
      setInventoryDaysLabel('Last 30 Days');
      return api.reports.inventoryUsage(30).catch(() => null);
    };

    const fetchAllReports = async () => {
      try {
        const [
          dashboardStats,
          monthlyFinancial,
          inventory,
          routine,
          debt,
          vendor
        ] = await Promise.all([
          api.dashboard.statistics(),
          fetchMonthlyFinancial(),
          fetchInventoryUsage(),
          api.reports.routineServices().catch(() => null),
          api.reports.customerDebt().catch(() => null),
          api.reports.vendorPayments().catch(() => null),
        ]);
        
        setStats(dashboardStats);
        setMonthlyReport(monthlyFinancial);
        setInventoryUsage(inventory);
        setRoutineServices(routine);
        setCustomerDebt(debt);
        setVendorPayments(vendor);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  const handleApplyFinancialFilter = async () => {
    const range = resolveMonthRange(financialMonths.start, financialMonths.end);
    if (!range) {
      const report = await api.reports.monthlyFinancial().catch(() => null);
      setMonthlyReport(report);
      return;
    }

    const months = buildMonthRange(range.start, range.end);
    const reports = await Promise.all(
      months.map((month) => api.reports.monthlyFinancial(month.month, month.year).catch(() => null))
    );
    setMonthlyReport(aggregateMonthlyReports(reports));
  };

  const handleApplyInventoryFilter = async () => {
    const range = resolveMonthRange(inventoryMonths.start, inventoryMonths.end);
    if (!range) {
      setInventoryDaysLabel('Last 30 Days');
      const report = await api.reports.inventoryUsage(30).catch(() => null);
      setInventoryUsage(report);
      return;
    }

    const days = Math.max(1, Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setInventoryDaysLabel(`${days} Days`);
    const report = await api.reports.inventoryUsage(days).catch(() => null);
    setInventoryUsage(report);
  };

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2.5 text-sm text-gray-600 font-medium transition ${
        activeTab === id
          ? 'bg-[#ffe600] text-gray-900'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      } rounded-t-lg`}
    >
      {label}
    </button>
  );

  const MonthRangeFilter = ({
    title,
    value,
    onChange,
    onApply,
    onReset,
  }: {
    title: string;
    value: { start: string; end: string };
    onChange: (next: { start: string; end: string }) => void;
    onApply: () => void;
    onReset?: () => void;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-end gap-4">
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Start Month</label>
        <input
          type="month"
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">End Month</label>
        <input
          type="month"
          value={value.end}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      <button
        onClick={onApply}
        className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium"
      >
        Apply
      </button>
      {onReset && (
        <button
          onClick={onReset}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          Reset
        </button>
      )}
    </div>
  );

  const routineRange = resolveMonthRange(routineMonths.start, routineMonths.end);
  const filteredRoutine = useMemo(() => {
    if (!routineServices) return null;
    if (!routineRange) return routineServices;

    const filterList = (items: any[], dateKey: string) =>
      (items || []).filter((item) => isDateInRange(item[dateKey], routineRange));

    const upcoming = filterList(routineServices.upcoming_services || [], 'next_service_date');
    const overdue = filterList(routineServices.overdue_services || [], 'next_service_date');

    return {
      ...routineServices,
      upcoming_services: upcoming,
      overdue_services: overdue,
      recent_count: routineServices.recent_count,
    };
  }, [routineServices, routineRange]);

  const debtRange = resolveMonthRange(debtMonths.start, debtMonths.end);
  const filteredDebt = useMemo(() => {
    if (!customerDebt) return null;
    if (!debtRange) return customerDebt;

    const debts = (customerDebt.debts || []).map((debt: any) => {
      const filteredInvoices = (debt.invoices || []).filter((invoice: any) =>
        isDateInRange(invoice.due_date, debtRange)
      );
      const total = filteredInvoices.reduce((sum: number, invoice: any) => sum + Number(invoice.remaining || 0), 0);
      return {
        ...debt,
        invoices: filteredInvoices,
        total_debt: total,
      };
    }).filter((debt: any) => debt.invoices.length > 0);

    const totalOutstanding = debts.reduce((sum: number, debt: any) => sum + Number(debt.total_debt || 0), 0);
    return {
      ...customerDebt,
      total_outstanding_debt: totalOutstanding,
      debts,
    };
  }, [customerDebt, debtRange]);

  const vendorRange = resolveMonthRange(vendorMonths.start, vendorMonths.end);
  const filteredVendor = useMemo(() => {
    if (!vendorPayments) return null;
    if (!vendorRange) return vendorPayments;

    const filteredServices = (vendorPayments.outstanding_services || []).filter((service: any) =>
      isDateInRange(service.pickup_date || service.created_at || service.service_date, vendorRange)
    );

    const filteredInventory = (vendorPayments.outstanding_inventory || []).filter((item: any) =>
      isDateInRange(item.credit_due_date || item.created_at, vendorRange)
    );

    return {
      ...vendorPayments,
      outstanding_services: filteredServices,
      outstanding_inventory: filteredInventory,
    };
  }, [vendorPayments, vendorRange]);

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-600 py-12">Loading reports...</div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b">
              <TabButton id="overview" label="Overview" />
              <TabButton id="financial" label="Financial" />
              <TabButton id="inventory" label="Inventory" />
              <TabButton id="routine" label="Routine Services" />
              <TabButton id="debt" label="Customer Debt" />
              <TabButton id="vendor" label="Vendor Payments" />
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Total Cars</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats?.total_cars || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">All vehicles</p>
                  </div>
                  <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Cars In Shop</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats?.in_shop || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Currently servicing</p>
                  </div>
                  <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Completed This Month</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats?.completed_this_month || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Customer Debt</h3>
                    <p className="text-2xl font-bold text-gray-800">{formatCedi(stats?.outstanding_customer_debt)}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending payment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="dashboard-section p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Outstanding Customer Debt</span>
                        <span className="font-bold text-primary-600">{formatCedi(stats?.outstanding_customer_debt)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Outstanding Vendor Credit</span>
                        <span className="font-bold text-orange-600">{formatCedi(-(stats?.outstanding_vendor_credit || 0))}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Total Invoiced This Month</span>
                        <span className="font-bold text-green-600">{formatCedi(stats?.total_invoiced_this_month)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-section p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setActiveTab('financial')}
                        className="w-full dashboard-action text-sm"
                      >
                        View Financial Report
                      </button>
                      <button 
                        onClick={() => setActiveTab('debt')}
                        className="w-full dashboard-action text-sm"
                      >
                        View Customer Debt
                      </button>
                      <button 
                        onClick={() => setActiveTab('vendor')}
                        className="w-full dashboard-action text-sm"
                      >
                        View Vendor Payments
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && monthlyReport && (
              <div className="space-y-4">
                <MonthRangeFilter
                  title="Financial Report Range"
                  value={financialMonths}
                  onChange={setFinancialMonths}
                  onApply={handleApplyFinancialFilter}
                  onReset={async () => {
                    setFinancialMonths({ start: '', end: '' });
                    const report = await api.reports.monthlyFinancial().catch(() => null);
                    setMonthlyReport(report);
                  }}
                />
                <div className="dashboard-section p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Monthly Financial Report</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Inflows</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Total Invoiced</span>
                          <span className="font-bold">{formatCedi(monthlyReport.inflows?.total_invoiced)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Payments Received</span>
                          <span className="font-bold text-green-600">{formatCedi(monthlyReport.inflows?.total_payments)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Expenditures</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Inventory Purchases</span>
                          <span className="font-bold text-primary-600">{formatCedi(monthlyReport.expenditures?.inventory_purchases)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Outsourced Services</span>
                          <span className="font-bold text-primary-600">{formatCedi(monthlyReport.expenditures?.outsourced_costs)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b font-semibold">
                          <span className="text-gray-600">Total Expenditure</span>
                          <span className="text-primary-600">{formatCedi(monthlyReport.expenditures?.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-subcard p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold text-gray-700">Profit/Loss</span>
                      <span className={`text-3xl font-bold ${
                        (monthlyReport.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-primary-600'
                      }`}>
                        {formatCedi(monthlyReport.profit_loss)}
                      </span>
                    </div>
                  </div>

                  {monthlyReport.operations && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Operations</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="dashboard-subcard p-4">
                          <div className="text-sm text-gray-600">Cars Received</div>
                          <div className="text-2xl font-bold">{monthlyReport.operations.cars_received}</div>
                        </div>
                        <div className="dashboard-subcard p-4">
                          <div className="text-sm text-gray-600">Cars Completed</div>
                          <div className="text-2xl font-bold">{monthlyReport.operations.cars_completed}</div>
                        </div>
                        <div className="dashboard-subcard p-4">
                          <div className="text-sm text-gray-600">Routine Services</div>
                          <div className="text-2xl font-bold">{monthlyReport.operations.routine_services}</div>
                        </div>
                        <div className="dashboard-subcard p-4">
                          <div className="text-sm text-gray-600">Service Revenue</div>
                          <div className="text-base font-bold">{formatCedi(monthlyReport.operations.routine_service_revenue)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && inventoryUsage && (
              <div className="space-y-4">
                <MonthRangeFilter
                  title="Inventory Usage Range"
                  value={inventoryMonths}
                  onChange={setInventoryMonths}
                  onApply={handleApplyInventoryFilter}
                  onReset={async () => {
                    setInventoryMonths({ start: '', end: '' });
                    setInventoryDaysLabel('Last 30 Days');
                    const report = await api.reports.inventoryUsage(30).catch(() => null);
                    setInventoryUsage(report);
                  }}
                />
                <div className="dashboard-section p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Inventory Usage Report ({inventoryDaysLabel})</h3>
                  
                  {inventoryUsage.usage && inventoryUsage.usage.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-4 py-2.5 text-sm text-gray-600 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-2.5 text-sm text-gray-600 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Used</th>
                            <th className="px-4 py-2.5 text-sm text-gray-600 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-4 py-2.5 text-sm text-gray-600 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            <th className="px-4 py-2.5 text-sm text-gray-600 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventoryUsage.usage.slice(0, 15).map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.inventory_item__name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.inventory_item__category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                {item.quantity_used}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary-600">
                                {formatCedi(item.total_cost)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                                {formatCedi(item.total_revenue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                {formatCedi(item.profit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No inventory usage data available</p>
                  )}

                  {inventoryUsage.low_stock_items && inventoryUsage.low_stock_items.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-primary-600 mb-3">⚠️ Low Stock Alert</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inventoryUsage.low_stock_items.map((item: any) => (
                          <div key={item.id} className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                            <div className="font-semibold text-gray-800">{item.name}</div>
                            <div className="text-sm text-primary-600">
                              Stock: {item.stock_quantity} / Threshold: {item.low_stock_threshold}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Routine Services Tab */}
            {activeTab === 'routine' && filteredRoutine && (
              <div className="space-y-4">
                <MonthRangeFilter
                  title="Routine Services Range"
                  value={routineMonths}
                  onChange={setRoutineMonths}
                  onApply={() => setRoutineMonths({ ...routineMonths })}
                  onReset={() => setRoutineMonths({ start: '', end: '' })}
                />
                <div className="dashboard-section p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Routine Services Report</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Upcoming Services</div>
                      <div className="text-3xl font-bold text-yellow-700">
                        {filteredRoutine.upcoming_services?.length || 0}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Overdue Services</div>
                      <div className="text-3xl font-bold text-orange-700">
                        {filteredRoutine.overdue_services?.length || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Recent Services</div>
                      <div className="text-3xl font-bold text-green-700">
                        {filteredRoutine.recent_count || 0}
                      </div>
                    </div>
                  </div>

                  {filteredRoutine.overdue_services && filteredRoutine.overdue_services.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-primary-600 mb-3">Overdue Services</h4>
                      <div className="space-y-3">
                        {filteredRoutine.overdue_services.map((car: any) => (
                          <div key={car.id} className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {car.make} {car.model} ({car.number_plate})
                                </div>
                                <div className="text-sm text-gray-600">{car.customer_name}</div>
                                <div className="text-xs text-primary-600 mt-1">
                                  Due: {car.next_service_date}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredRoutine.upcoming_services && filteredRoutine.upcoming_services.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-600 mb-3">Upcoming Services (Next 30 Days)</h4>
                      <div className="space-y-3">
                        {filteredRoutine.upcoming_services.map((car: any) => (
                          <div key={car.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {car.make} {car.model} ({car.number_plate})
                                </div>
                                <div className="text-sm text-gray-600">{car.customer_name}</div>
                                <div className="text-xs text-yellow-600 mt-1">
                                  Due: {car.next_service_date}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Debt Tab */}
            {activeTab === 'debt' && filteredDebt && (
              <div className="space-y-4">
                <MonthRangeFilter
                  title="Customer Debt Range"
                  value={debtMonths}
                  onChange={setDebtMonths}
                  onApply={() => setDebtMonths({ ...debtMonths })}
                  onReset={() => setDebtMonths({ start: '', end: '' })}
                />
                <div className="dashboard-section p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Customer Debt Report</h3>
                    <div className="bg-primary-50 border border-primary-200 px-4 py-2.5 text-sm text-gray-600 rounded-lg">
                      <div className="text-sm text-gray-600">Total Outstanding</div>
                      <div className="text-2xl font-bold text-primary-600">
                        {formatCedi(filteredDebt.total_outstanding_debt)}
                      </div>
                    </div>
                  </div>

                  {filteredDebt.debts && filteredDebt.debts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredDebt.debts.map((debt: any) => (
                        <div key={debt.customer_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-lg text-gray-800">{debt.customer_name}</div>
                              <div className="text-sm text-gray-600">{debt.customer_email}</div>
                              <div className="text-sm text-gray-600">{debt.customer_phone}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Total Debt</div>
                              <div className="text-2xl font-bold text-primary-600">{formatCedi(debt.total_debt)}</div>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            {debt.invoices.map((invoice: any, idx: number) => (
                              <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                                <div className="flex justify-between">
                                  <span className="font-medium">{invoice.invoice_number}</span>
                                  <span className="text-primary-600 font-bold">{formatCedi(invoice.remaining)}</span>
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  {invoice.car} • Due: {invoice.due_date}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No outstanding customer debt</p>
                  )}
                </div>
              </div>
            )}

            {/* Vendor Payments Tab */}
            {activeTab === 'vendor' && filteredVendor && (
              <div className="space-y-4">
                <MonthRangeFilter
                  title="Vendor Payments Range"
                  value={vendorMonths}
                  onChange={setVendorMonths}
                  onApply={() => setVendorMonths({ ...vendorMonths })}
                  onReset={() => setVendorMonths({ start: '', end: '' })}
                />
                <div className="dashboard-section p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Vendor Payment Report</h3>
                    <div className="bg-orange-50 border border-orange-200 px-4 py-2.5 text-sm text-gray-600 rounded-lg">
                      <div className="text-sm text-gray-600">Total Outstanding</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCedi(filteredVendor.total_vendor_debt)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Outsourced Services Debt</div>
                      <div className="text-2xl font-bold text-yellow-700">
                        {formatCedi(filteredVendor.outsourced_services_debt)}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Inventory Credit Debt</div>
                      <div className="text-2xl font-bold text-orange-700">
                        {formatCedi(-(filteredVendor.inventory_credit_debt || 0))}
                      </div>
                    </div>
                  </div>

                  {filteredVendor.outstanding_services && filteredVendor.outstanding_services.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Outstanding Outsourced Services</h4>
                      <div className="space-y-2">
                        {filteredVendor.outstanding_services.slice(0, 10).map((service: any) => (
                          <div key={service.id} className="flex justify-between items-center py-3 border-b">
                            <div>
                              <div className="font-medium text-gray-800">{service.service_name}</div>
                              <div className="text-sm text-gray-500">
                                {service.vendor_name || service.vendor_company_name} • {service.car}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary-600">{formatCedi(service.remaining_balance)}</div>
                              <div className="text-xs text-gray-500">{service.payment_status_display}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredVendor.outstanding_inventory && filteredVendor.outstanding_inventory.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Inventory on Credit</h4>
                      <div className="space-y-2">
                        {filteredVendor.outstanding_inventory.slice(0, 10).map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center py-3 border-b">
                            <div>
                              <div className="font-medium text-gray-800">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                {item.vendor_name || item.supplier_name} • Due: {item.credit_due_date}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary-600">{formatCedi(item.remaining_credit)}</div>
                              <div className="text-xs text-gray-500">Qty: {item.stock_quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}


