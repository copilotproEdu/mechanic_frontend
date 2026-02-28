'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import { User } from '@/types';
import { FiPlus } from 'react-icons/fi';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'administrator',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'manager',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.j@company.com',
    role: 'manager',
  },
];

export default function UsersSettingsPage() {
  const [users] = useState<User[]>(mockUsers);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Role',
      render: (user: User) => (
        <span className="badge badge-confirmed capitalize">
          {user.role}
        </span>
      )
    },
  ];

  return (
    <div>
      <div className="mb-6 card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Maximum Users</p>
            <p className="text-2xl font-bold">50</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Available Slots</p>
            <p className="text-2xl font-bold">{50 - users.length}</p>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  );
}


