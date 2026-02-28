'use client';

import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiPlus, FiEdit2, FiEye, FiFileText, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { formatDate } from '@/lib/dateUtils';

const mockPurchaseOrders = [
  { id: 'PO001', supplier: 'Auto Parts Co', date: '2024-11-15', amount: 5450, status: 'pending', items: 12 },
  { id: 'PO002', supplier: 'Parts Warehouse', date: '2024-11-14', amount: 3200, status: 'active', items: 8 },
  { id: 'PO003', supplier: 'Global Auto Supply', date: '2024-11-13', amount: 7800, status: 'pending', items: 15 },
  { id: 'PO004', supplier: 'Industrial Supplies', date: '2024-11-12', amount: 4500, status: 'active', items: 10 },
  { id: 'PO005', supplier: 'Tech Components', date: '2024-11-11', amount: 2300, status: 'inactive', items: 6 },
];

export default function PurchaseOrdersPage() {
  const columns = [
    { key: 'id', header: 'PO Number' },
    { key: 'supplier', header: 'Supplier' },
    { 
      key: 'date', 
      header: 'Date',
      render: (po: any) => po.date ? formatDate(po.date) : 'N/A'
    },
    { key: 'items', header: 'Items' },
    { 
      key: 'amount', 
      header: 'Amount',
      render: (po: any) => `GHS ${po.amount.toFixed(2)}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (po: any) => <StatusBadge status={po.status} />
    },
  ];

  const totalPOs = mockPurchaseOrders.length;
  const totalAmount = mockPurchaseOrders.reduce((sum, po) => sum + po.amount, 0);
  const pendingPOs = mockPurchaseOrders.filter(po => po.status === 'pending').length;
  const activePOs = mockPurchaseOrders.filter(po => po.status === 'active').length;

  return (
    <div>
      <PageHeader 
        title="Purchase Orders" 
        subtitle="Manage purchase orders from suppliers"
        action={{
          label: 'Create PO',
          icon: <FiPlus className="w-4 h-4" />,
          onClick: () => console.log('Create PO clicked')
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total POs"
          value={totalPOs}
          icon={<FiFileText className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Amount"
          value={`GHS ${(totalAmount / 1000).toFixed(1)}K`}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard
          title="Pending"
          value={pendingPOs}
          icon={<FiAlertCircle className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Active"
          value={activePOs}
          icon={<FiFileText className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Purchase Orders Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Purchase Orders</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search POs..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockPurchaseOrders} />
      </div>
    </div>
  );
}


