'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiUser, FiUsers, FiMail, FiPhone, FiBook, FiCheckCircle, FiUserPlus } from 'react-icons/fi';

// Mock data for teachers
const mockTeachers = [
  {
    id: '1',
    name: 'Mr. Smith',
    email: 'smith@school.edu',
    phone: '+233 123 456 789',
    subject: 'Mathematics',
    classes: 'Grade 10A, Grade 11B',
    joinDate: '2020-08-15',
    status: 'active',
    qualification: 'MSc. Mathematics'
  },
  {
    id: '2',
    name: 'Ms. Johnson',
    email: 'johnson@school.edu',
    phone: '+233 456 789 012',
    subject: 'English',
    classes: 'Grade 9A, Grade 10B',
    joinDate: '2021-01-10',
    status: 'active',
    qualification: 'M.A. English'
  },
  {
    id: '3',
    name: 'Dr. Wilson',
    email: 'wilson@school.edu',
    phone: '+233 789 012 345',
    subject: 'Science',
    classes: 'Grade 8A, Grade 9B',
    joinDate: '2019-09-01',
    status: 'on-leave',
    qualification: 'PhD. Physics'
  },
];

export default function ManagerTeachersPage() {
  const columns = [
    { key: 'name', header: 'Teacher Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'subject', header: 'Subject' },
    { key: 'classes', header: 'Classes' },
    { key: 'joinDate', header: 'Join Date' },
    {
      key: 'status',
      header: 'Status',
      render: (teacher: any) => <StatusBadge status={teacher.status} />
    },
    { key: 'qualification', header: 'Qualification' },
  ];

  return (
    <div className="p-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Teachers"
          value="45"
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatCard
          title="Active Teachers"
          value="42"
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
          trend={{ value: 1.5, isPositive: true }}
        />
        <StatCard
          title="New This Month"
          value="2"
          icon={<FiUser className="w-6 h-6" />}
          color="purple"
          trend={{ value: 5.0, isPositive: true }}
        />
        <StatCard
          title="On Leave"
          value="3"
          icon={<FiUser className="w-6 h-6" />}
          color="pink"
          trend={{ value: -0.5, isPositive: false }}
        />
      </div>

      {/* Teachers Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Teachers</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search teachers..."
              className="input-field w-64"
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={mockTeachers} />
      </div>
    </div>
  );
}
