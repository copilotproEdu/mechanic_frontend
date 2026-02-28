'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiUsers } from 'react-icons/fi';

const mockContacts = [
  { id: 'CONT001', name: 'John Smith', email: 'john@abcmotors.com', phone: '555-0101', city: 'New York', type: 'Customer', status: 'active' },
  { id: 'CONT002', name: 'Sarah Johnson', email: 'sarah@xyzauto.com', phone: '555-0102', city: 'Los Angeles', type: 'Customer', status: 'active' },
  { id: 'CONT003', name: 'Mike Wilson', email: 'mike@localmech.com', phone: '555-0103', city: 'Chicago', type: 'Supplier', status: 'active' },
  { id: 'CONT004', name: 'Emily Brown', email: 'emily@contactco.com', phone: '555-0104', city: 'Houston', type: 'Partner', status: 'active' },
  { id: 'CONT005', name: 'David Lee', email: 'david@supplier.com', phone: '555-0105', city: 'Phoenix', type: 'Supplier', status: 'inactive' },
];

export default function ContactsPage() {
  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City' },
    { key: 'type', header: 'Type' },
    {
      key: 'status',
      header: 'Status',
      render: (contact: any) => <StatusBadge status={contact.status} />
    },
  ];

  const customerCount = mockContacts.filter(c => c.type === 'Customer').length;
  const supplierCount = mockContacts.filter(c => c.type === 'Supplier').length;
  const partnerCount = mockContacts.filter(c => c.type === 'Partner').length;

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Contacts"
          value={mockContacts.length}
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Customers"
          value={customerCount}
          icon={<FiUsers className="w-6 h-6" />}
          color="green"
          trend={{ value: 8.1, isPositive: true }}
        />
        <StatCard
          title="Suppliers"
          value={supplierCount}
          icon={<FiUsers className="w-6 h-6" />}
          color="primary"
          trend={{ value: 2.3, isPositive: true }}
        />
        <StatCard
          title="Partners"
          value={partnerCount}
          icon={<FiUsers className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Contacts Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Contacts</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search contacts..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockContacts} />
      </div>
    </div>
  );
}


