'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiPackage, FiTrendingUp, FiAlertCircle, FiPlus } from 'react-icons/fi';

// Mock warehouse data
const mockWarehouseA = [
  {
    id: '1',
    itemName: 'Desk Lamp',
    sku: 'DL-001',
    quantity: 45,
    reorderLevel: 20,
    location: 'Shelf A-1',
    lastRestocked: '2024-11-15',
    status: 'active'
  },
  {
    id: '2',
    itemName: 'Office Chair',
    sku: 'OC-002',
    quantity: 12,
    reorderLevel: 10,
    location: 'Shelf A-2',
    lastRestocked: '2024-11-18',
    status: 'active'
  },
  {
    id: '3',
    itemName: 'Filing Cabinet',
    sku: 'FC-003',
    quantity: 8,
    reorderLevel: 5,
    location: 'Shelf A-3',
    lastRestocked: '2024-11-10',
    status: 'low-stock'
  },
  {
    id: '4',
    itemName: 'Printer Paper Box',
    sku: 'PP-004',
    quantity: 150,
    reorderLevel: 50,
    location: 'Shelf A-4',
    lastRestocked: '2024-11-20',
    status: 'active'
  },
  {
    id: '5',
    itemName: 'Whiteboard Markers',
    sku: 'WM-005',
    quantity: 3,
    reorderLevel: 25,
    location: 'Shelf A-5',
    lastRestocked: '2024-11-01',
    status: 'critical'
  },
];

export default function WarehouseAPage() {
  const columns = [
    { key: 'sku', header: 'SKU' },
    { key: 'itemName', header: 'Item Name' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'reorderLevel', header: 'Reorder Level' },
    { key: 'location', header: 'Location' },
    { key: 'lastRestocked', header: 'Last Restocked' },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => {
        const statusMap: { [key: string]: string } = {
          'active': 'active',
          'low-stock': 'pending',
          'critical': 'inactive'
        };
        return <StatusBadge status={statusMap[item.status] as any} />;
      }
    },
  ];

  const totalItems = mockWarehouseA.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = mockWarehouseA.filter(item => item.quantity <= item.reorderLevel).length;
  const criticalItems = mockWarehouseA.filter(item => item.status === 'critical').length;

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Items"
          value={mockWarehouseA.length}
          icon={<FiPackage className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Quantity"
          value={totalItems}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={<FiAlertCircle className="w-6 h-6" />}
          color="primary"
          trend={{ value: -2.1, isPositive: false }}
        />
        <StatCard
          title="Critical Items"
          value={criticalItems}
          icon={<FiPackage className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Inventory Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Warehouse A Inventory</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search items..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockWarehouseA} />
      </div>
    </div>
  );
}
