'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Invoice } from '@/types';
import { FiPlus } from 'react-icons/fi';

const mockInvoices: Invoice[] = [
  {
    id: '1',
    name: 'INV-001',
    date: '2024-11-15',
    amount: 5420.00,
    paid: 5420.00,
    status: 'paid',
  },
  {
    id: '2',
    name: 'INV-002',
    date: '2024-11-10',
    amount: 3200.00,
    paid: 0,
    status: 'overdue',
    dueDate: '2024-11-08',
  },
  {
    id: '3',
    name: 'INV-003',
    date: '2024-11-12',
    amount: 7850.00,
    paid: 7850.00,
    status: 'paid',
  },
  {
    id: '4',
    name: 'INV-004',
    date: '2024-11-14',
    amount: 4100.00,
    paid: 0,
    status: 'sent',
  },
];

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'date', header: 'Date' },
    {
      key: 'amount',
      header: 'Amount',
      render: (invoice: Invoice) => `₵${invoice.amount.toFixed(2)}`
    },
    {
      key: 'paid',
      header: 'Paid',
      render: (invoice: Invoice) => `₵${invoice.paid.toFixed(2)}`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (invoice: Invoice) => <StatusBadge status={invoice.status} />
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-end">
        <button className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Invoice
        </button>
      </div>

      <DataTable columns={columns} data={invoices} />
    </div>
  );
}
