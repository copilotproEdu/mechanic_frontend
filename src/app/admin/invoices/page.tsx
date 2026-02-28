'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiDownload, FiMail, FiEye, FiEdit2, FiFileText, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { formatDate } from '@/lib/dateUtils';

const mockInvoices = [
  { id: 'INV001', order: 'ORD001', customer: 'ABC Motors', date: '2024-11-16', amount: 2456.78, status: 'active', dueDate: '2024-11-20' },
  { id: 'INV002', order: 'ORD002', customer: 'XYZ Auto Repair', date: '2024-11-15', amount: 3892.45, status: 'active', dueDate: '2024-11-19' },
  { id: 'INV003', order: 'ORD003', customer: 'Local Mechanic', date: '2024-11-14', amount: 1234.50, status: 'pending', dueDate: '2024-11-17' },
  { id: 'INV004', order: 'ORD004', customer: 'Fleet Services', date: '2024-11-13', amount: 5245.99, status: 'active', dueDate: '2024-11-16' },
  { id: 'INV005', order: 'ORD005', customer: 'Premium Auto', date: '2024-11-12', amount: 2567.80, status: 'inactive', dueDate: '2024-11-22' },
];

export default function InvoicesPage() {
  const columns = [
    { key: 'id', header: 'Invoice #' },
    { key: 'order', header: 'Order #' },
    { key: 'customer', header: 'Customer' },
    { 
      key: 'date', 
      header: 'Date',
      render: (invoice: any) => invoice.date ? formatDate(invoice.date) : 'N/A'
    },
    { 
      key: 'amount', 
      header: 'Amount',
      render: (invoice: any) => `GHS ${invoice.amount.toFixed(2)}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (invoice: any) => <StatusBadge status={invoice.status} />
    },
    { 
      key: 'dueDate', 
      header: 'Due Date',
      render: (invoice: any) => invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'
    },
  ];

  const totalInvoices = mockInvoices.length;
  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = mockInvoices.filter(inv => inv.status === 'active').length;
  const overDueInvoices = mockInvoices.filter(inv => inv.status === 'inactive').length;

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Invoices"
          value={totalInvoices}
          icon={<FiFileText className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Amount"
          value={`GHS ${(totalAmount / 1000).toFixed(1)}K`}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Paid"
          value={paidInvoices}
          icon={<FiFileText className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Overdue"
          value={overDueInvoices}
          icon={<FiAlertCircle className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Invoices Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Invoices</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search invoices..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockInvoices} />
      </div>
    </div>
  );
}


