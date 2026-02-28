'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiPackage, FiUsers } from 'react-icons/fi';

const mockSuppliers = [
  { id: '1', name: 'Auto Parts Co', email: 'info@autoparts.com', phone: '+1-555-0101', city: 'New York', status: 'active' },
  { id: '2', name: 'Parts Warehouse', email: 'sales@partswarehouse.com', phone: '+1-555-0102', city: 'Los Angeles', status: 'active' },
  { id: '3', name: 'Global Auto Supply', email: 'contact@globalauto.com', phone: '+1-555-0103', city: 'Chicago', status: 'active' },
  { id: '4', name: 'Industrial Supplies Ltd', email: 'orders@indsupp.com', phone: '+1-555-0104', city: 'Houston', status: 'inactive' },
  { id: '5', name: 'Tech Components Inc', email: 'sales@techcomp.com', phone: '+1-555-0105', city: 'San Francisco', status: 'active' },
];

export default function SuppliersPage() {
  const columns = [
    { key: 'name', header: 'Supplier Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City' },
    {
      key: 'status',
      header: 'Status',
      render: (supplier: any) => <StatusBadge status={supplier.status} />
    },
  ];

  const activeSuppliers = mockSuppliers.filter(s => s.status === 'active').length;
  const inactiveSuppliers = mockSuppliers.filter(s => s.status === 'inactive').length;

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Suppliers"
          value={mockSuppliers.length}
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active"
          value={activeSuppliers}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 4.2, isPositive: true }}
        />
        <StatCard
          title="Inactive"
          value={inactiveSuppliers}
          icon={<FiPackage className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Pending"
          value="0"
          icon={<FiUsers className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Suppliers Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Suppliers</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search suppliers..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockSuppliers} />
      </div>
    </div>
  );
}


