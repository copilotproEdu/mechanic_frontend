'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { Contact } from '@/types';
import { FiPlus } from 'react-icons/fi';

const mockContacts: Contact[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@acme.com',
    company: 'Acme Corp',
    phone: '+1 (555) 123-4567',
    billingAddress: '123 Main St, New York, NY 10001',
    shippingAddress: '123 Main St, New York, NY 10001',
  },
  {
    id: '2',
    fullName: 'Sarah Johnson',
    email: 'sarah.j@techstart.com',
    company: 'TechStart Inc',
    phone: '+1 (555) 234-5678',
    billingAddress: '456 Tech Ave, San Francisco, CA 94105',
    shippingAddress: '456 Tech Ave, San Francisco, CA 94105',
  },
  {
    id: '3',
    fullName: 'Michael Brown',
    email: 'm.brown@globaltrade.com',
    company: 'Global Trade LLC',
    phone: '+1 (555) 345-6789',
    billingAddress: '789 Commerce Blvd, Chicago, IL 60601',
    shippingAddress: '789 Commerce Blvd, Chicago, IL 60601',
  },
];

export default function ContactsPage() {
  const [contacts] = useState<Contact[]>(mockContacts);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'fullName', header: 'Full Name' },
    { key: 'email', header: 'E-mail' },
    { key: 'company', header: 'Company' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      <DataTable columns={columns} data={contacts} />
    </div>
  );
}
