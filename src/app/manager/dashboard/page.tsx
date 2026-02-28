'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import StudentsWithFeesCard from '@/components/StudentsWithFeesCard';
import { FiUsers, FiUser, FiBook, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { Order, Invoice } from '@/types';

// Mock data for school management
const mockStudents = [
  {
    id: '1',
    name: 'John Doe',
    class: 'Grade 10A',
    status: 'active',
    enrollmentDate: '2024-09-01',
    feesPaid: 2500
  },
  {
    id: '2',
    name: 'Jane Smith',
    class: 'Grade 9B',
    status: 'active',
    enrollmentDate: '2024-09-01',
    feesPaid: 2500
  },
  {
    id: '3',
    name: 'Michael Johnson',
    class: 'Grade 11C',
    status: 'active',
    enrollmentDate: '2024-09-01',
    feesPaid: 2500
  },
];

const mockTeachers = [
  {
    id: '1',
    name: 'Mr. Smith',
    subject: 'Mathematics',
    status: 'active',
    classes: 'Grade 10A, Grade 11B'
  },
  {
    id: '2',
    name: 'Ms. Johnson',
    subject: 'English',
    status: 'active',
    classes: 'Grade 9A, Grade 10B'
  },
  {
    id: '3',
    name: 'Dr. Wilson',
    subject: 'Science',
    status: 'active',
    classes: 'Grade 8A, Grade 9B'
  },
];

// Mock data for payments
const mockPayments = [
  {
    id: '1',
    studentName: 'John Doe',
    studentClass: 'Grade 10A',
    amount: 2500,
    date: '2024-11-20',
    method: 'Bank Transfer',
    receiptNumber: 'REC-001',
    status: 'completed'
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    studentClass: 'Grade 9B',
    amount: 1800,
    date: '2024-11-19',
    method: 'Cash',
    receiptNumber: 'REC-002',
    status: 'completed'
  },
  {
    id: '3',
    studentName: 'Michael Johnson',
    studentClass: 'Grade 11C',
    amount: 1200,
    date: '2024-11-18',
    method: 'Mobile Money',
    receiptNumber: 'REC-003',
    status: 'completed'
  },
  {
    id: '4',
    studentName: 'Sarah Williams',
    studentClass: 'Grade 8A',
    amount: 2500,
    date: '2024-11-17',
    method: 'Bank Transfer',
    receiptNumber: 'REC-004',
    status: 'completed'
  },
];

export default function ManagerDashboard() {
  // Student columns for the table
  const studentColumns = [
    { key: 'name', header: 'Student Name' },
    { key: 'class', header: 'Class' },
    { key: 'enrollmentDate', header: 'Enrollment Date' },
    {
      key: 'status',
      header: 'Status',
      render: (student: any) => <StatusBadge status={student.status} />
    },
    {
      key: 'feesPaid',
      header: 'Fees Paid',
      render: (student: any) => `₵${student.feesPaid.toFixed(2)}`
    },
  ];

  // Teacher columns for the table
  const teacherColumns = [
    { key: 'name', header: 'Teacher Name' },
    { key: 'subject', header: 'Subject' },
    { key: 'classes', header: 'Classes' },
    {
      key: 'status',
      header: 'Status',
      render: (teacher: any) => <StatusBadge status={teacher.status} />
    },
  ];
  
  // Payment columns for the table
  const paymentColumns = [
    { key: 'receiptNumber', header: 'Receipt' },
    { key: 'studentName', header: 'Student' },
    { key: 'studentClass', header: 'Class' },
    { key: 'date', header: 'Date' },
    { key: 'method', header: 'Method' },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment: any) => `₵${payment.amount.toFixed(2)}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (payment: any) => <StatusBadge status={payment.status} />
    },
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
          title="Total Teachers"
          value="45"
          icon={<FiUser className="w-6 h-6" />}
          color="green"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Total Classes"
          value="28"
          icon={<FiBook className="w-6 h-6" />}
          color="purple"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Attendance Rate"
          value="94.3%"
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="pink"
          trend={{ value: 1.5, isPositive: true }}
        />
      </div>

      {/* Finance Tracker Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="dashboard-section">
          <h3 className="text-lg font-semibold mb-4">Finance Tracker</h3>
          
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="dashboard-subcard">
              <p className="text-sm text-gray-600">Total Expected</p>
              <p className="text-lg font-bold">₵305,000</p>
            </div>
            <div className="dashboard-subcard">
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-lg font-bold">₵285,000</p>
            </div>
            <div className="dashboard-subcard">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-lg font-bold">₵20,000</p>
            </div>
            <div className="dashboard-subcard">
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-lg font-bold">93.4%</p>
            </div>
          </div>
          
          {/* Progress Bar Visualization */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Collection Progress</span>
              <span>93.4%</span>
            </div>
            <div className="w-full bg-gray-100 border border-gray-200 rounded-full h-2.5">
              <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: '93.4%' }}></div>
            </div>
          </div>

          <p className="text-sm text-gray-600">Target: 95% | On track to meet goal</p>
        </div>

        <StudentsWithFeesCard />
      </div>

      {/* Recent Payments */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
        <DataTable columns={paymentColumns} data={mockPayments} />
      </div>
    </div>
  );
}
