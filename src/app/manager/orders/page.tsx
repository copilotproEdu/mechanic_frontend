'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Order } from '@/types';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';

const mockOrders: Order[] = [
  {
    id: '1',
    date: '2024-11-15',
    orderNumber: 'ORD-001',
    customerName: 'Acme Corp',
    status: 'confirmed',
    invoiced: true,
    packed: true,
    shipped: false,
    amount: 5420.00,
  },
  {
    id: '2',
    date: '2024-11-14',
    orderNumber: 'ORD-002',
    customerName: 'TechStart Inc',
    status: 'draft',
    invoiced: false,
    packed: false,
    shipped: false,
    amount: 3200.00,
  },
  {
    id: '3',
    date: '2024-11-13',
    orderNumber: 'ORD-003',
    customerName: 'Global Trade LLC',
    status: 'closed',
    invoiced: true,
    packed: true,
    shipped: true,
    amount: 7850.00,
  },
  {
    id: '4',
    date: '2024-11-12',
    orderNumber: 'ORD-004',
    customerName: 'Innovation Labs',
    status: 'on-hold',
    invoiced: false,
    packed: false,
    shipped: false,
    amount: 4100.00,
  },
];

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'date', header: 'Date' },
    { key: 'orderNumber', header: 'Order Number' },
    { key: 'customerName', header: 'Customer Name' },
    { 
      key: 'status', 
      header: 'Status',
      render: (order: Order) => <StatusBadge status={order.status} />
    },
    { 
      key: 'invoiced', 
      header: 'Invoiced',
      render: (order: Order) => order.invoiced ? 
        <FiCheck className="text-green-600" /> : 
        <FiX className="text-primary-600" />
    },
    { 
      key: 'packed', 
      header: 'Packed',
      render: (order: Order) => order.packed ? 
        <FiCheck className="text-green-600" /> : 
        <FiX className="text-primary-600" />
    },
    { 
      key: 'shipped', 
      header: 'Shipped',
      render: (order: Order) => order.shipped ? 
        <FiCheck className="text-green-600" /> : 
        <FiX className="text-primary-600" />
    },
    { 
      key: 'amount', 
      header: 'Amount',
      render: (order: Order) => `??{order.amount.toFixed(2)}`
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-end">
        <button className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Order
        </button>
      </div>

      <DataTable columns={columns} data={orders} />
    </div>
  );
}
