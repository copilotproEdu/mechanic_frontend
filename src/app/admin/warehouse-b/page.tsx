'use client';

import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiPackage, FiTrendingUp, FiAlertCircle, FiPlus } from 'react-icons/fi';

// Mock warehouse data
const mockWarehouseB = [
  {
    id: '1',
    itemName: 'Textbooks - Mathematics',
    sku: 'TB-MATH-001',
    quantity: 120,
    reorderLevel: 50,
    location: 'Shelf B-1',
    lastRestocked: '2024-11-15',
    status: 'active'
  },
  {
    id: '2',
    itemName: 'Science Lab Equipment',
    sku: 'SLE-002',
    quantity: 35,
    reorderLevel: 30,
    location: 'Shelf B-2',
    lastRestocked: '2024-11-18',
    status: 'active'
  },
  {
    id: '3',
    itemName: 'Computer Keyboards',
    sku: 'CK-003',
    quantity: 22,
    reorderLevel: 20,
    location: 'Shelf B-3',
    lastRestocked: '2024-11-10',
    status: 'low-stock'
  },
  {
    id: '4',
    itemName: 'USB Flash Drives (32GB)',
    sku: 'UFD-004',
    quantity: 200,
    reorderLevel: 100,
    location: 'Shelf B-4',
    lastRestocked: '2024-11-20',
    status: 'active'
  },
  {
    id: '5',
    itemName: 'Network Cables',
    sku: 'NC-005',
    quantity: 8,
    reorderLevel: 50,
    location: 'Shelf B-5',
    lastRestocked: '2024-10-25',
    status: 'critical'
  },
  {
    id: '6',
    itemName: 'Projector Bulbs',
    sku: 'PB-006',
    quantity: 15,
    reorderLevel: 10,
    location: 'Shelf B-6',
    lastRestocked: '2024-11-12',
    status: 'active'
  },
];

export default function WarehouseBPage() {
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

  const totalItems = mockWarehouseB.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = mockWarehouseB.filter(item => item.quantity <= item.reorderLevel).length;
  const criticalItems = mockWarehouseB.filter(item => item.status === 'critical').length;

  return (
    <div>
      <PageHeader 
        title="Warehouse B" 
        subtitle="Manage inventory and stock levels in Warehouse B"
        action={{
          label: 'Add Item',
          icon: <FiPlus className="w-4 h-4" />,
          onClick: () => console.log('Add item clicked')
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Items"
          value={mockWarehouseB.length}
          icon={<FiPackage className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Quantity"
          value={totalItems}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 5.1, isPositive: true }}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={<FiAlertCircle className="w-6 h-6" />}
          color="primary"
          trend={{ value: -1.5, isPositive: false }}
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
          <h3 className="text-lg font-semibold">Warehouse B Inventory</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search items..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockWarehouseB} />
      </div>
    </div>
  );
}
