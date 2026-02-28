'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Package } from '@/types';
import { FiPlus, FiFilter } from 'react-icons/fi';

const mockPackages: Package[] = [
  {
    id: '1',
    date: '2024-11-15',
    name: 'PKG-001 - Acme Corp',
    status: 'shipped',
    trackingNumber: 'TRK123456789',
  },
  {
    id: '2',
    date: '2024-11-14',
    name: 'PKG-002 - TechStart Inc',
    status: 'not-shipped',
  },
  {
    id: '3',
    date: '2024-11-13',
    name: 'PKG-003 - Global Trade LLC',
    status: 'delivered',
    trackingNumber: 'TRK987654321',
  },
];

export default function PackagesPage() {
  const [packages] = useState<Package[]>(mockPackages);
  const [filter, setFilter] = useState<string>('all');

  const filteredPackages = filter === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.status === filter);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'date', header: 'Date' },
    { key: 'name', header: 'Name' },
    { 
      key: 'status', 
      header: 'Status',
      render: (pkg: Package) => <StatusBadge status={pkg.status} />
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-end gap-3">
        <select 
          className="input-field"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Packages</option>
          <option value="not-shipped">Not Shipped</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
        <button className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Package
        </button>
      </div>

      <DataTable columns={columns} data={filteredPackages} />
    </div>
  );
}
