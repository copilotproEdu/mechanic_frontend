'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiUser, FiUsers, FiMail, FiPhone, FiBook, FiCheckCircle, FiUserPlus } from 'react-icons/fi';

// Mock data for students
const mockStudents = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+233 123 456 789',
    class: 'Grade 10A',
    enrollmentDate: '2024-09-01',
    status: 'active',
    parentName: 'Robert Doe',
    parentPhone: '+233 987 654 321'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+233 456 789 012',
    class: 'Grade 9B',
    enrollmentDate: '2024-09-01',
    status: 'active',
    parentName: 'Mary Smith',
    parentPhone: '+233 654 321 098'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '+233 789 012 345',
    class: 'Grade 11C',
    enrollmentDate: '2024-09-01',
    status: 'inactive',
    parentName: 'David Johnson',
    parentPhone: '+233 321 098 765'
  },
];

export default function ManagerStudentsPage() {
  const columns = [
    { key: 'name', header: 'Student Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'class', header: 'Class' },
    { key: 'enrollmentDate', header: 'Enrollment Date' },
    {
      key: 'status',
      header: 'Status',
      render: (student: any) => <StatusBadge status={student.status} />
    },
    { key: 'parentName', header: 'Parent/Guardian' },
  ];

  return (
    <div className="p-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value="1,234"
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Active Students"
          value="1,187"
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="New This Month"
          value="45"
          icon={<FiUser className="w-6 h-6" />}
          color="purple"
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCard
          title="Inactive Students"
          value="47"
          icon={<FiUser className="w-6 h-6" />}
          color="pink"
          trend={{ value: -1.2, isPositive: false }}
        />
      </div>

      {/* Students Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Students</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search students..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockStudents} />
      </div>
    </div>
  );
}
