'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import StudentsWithFeesCard from '@/components/StudentsWithFeesCard';
import { FiUsers, FiUser, FiBook, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [feeStats, setFeeStats] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin, redirect if not
    checkUserRole();
    fetchDashboardData();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await api.users.me();
      if (user.role !== 'admin') {
        // Redirect non-admin users away from dashboard
        if (user.role === 'headteacher') {
          router.push('/admin/students');
        } else if (user.role === 'teacher') {
          router.push('/admin/attendance');
        } else if (user.role === 'parent') {
          router.push('/admin/reports');
        } else {
          router.push('/admin/students');
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [students, teachers, attendance, fees, payments, feedingPayments, classes] = await Promise.all([
        api.students.statistics(),
        api.teachers.statistics(),
        api.attendance.overallStats(),
        api.fees.studentFees.statistics(),
        api.fees.payments.list({ page_size: 10 }),
        api.fees.feedingFeePayments.list({ page_size: 10 }),
        api.classes.statistics(),
      ]);

      setStudentStats(students);
      setTeacherStats(teachers);
      console.log('Attendance Stats from API:', attendance);
      setAttendanceStats(attendance);
      setFeeStats(fees);
      setClassStats(classes);

      const schoolPayments = (payments.results || payments || []).map((payment: any) => ({
        ...payment,
        id: `school-${payment.id}`,
        payment_for: 'School Fees',
        amount: payment.amount,
        payment_date: payment.payment_date,
      }));

      const feedingPaymentsNormalized = (feedingPayments.results || feedingPayments || []).map((payment: any) => ({
        ...payment,
        id: `feeding-${payment.id}`,
        payment_for: 'Feeding Fees',
        amount: payment.amount,
        payment_date: payment.payment_date,
      }));

      const combinedPayments = [...schoolPayments, ...feedingPaymentsNormalized].sort((a, b) => {
        const dateA = a.payment_date ? new Date(a.payment_date).getTime() : 0;
        const dateB = b.payment_date ? new Date(b.payment_date).getTime() : 0;
        return dateB - dateA;
      });

      setRecentPayments(combinedPayments);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  // Student columns for the table
  const studentColumns = [
    { key: 'first_name', header: 'First Name' },
    { key: 'last_name', header: 'Last Name' },
    { key: 'current_class_name', header: 'Class' },
    { 
      key: 'enrollment_date', 
      header: 'Enrollment Date',
      render: (student: any) => student.enrollment_date ? formatDate(student.enrollment_date) : 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      render: (student: any) => <StatusBadge status={student.status || 'active'} />
    },
  ];

  // Teacher columns for the table
  const teacherColumns = [
    { key: 'first_name', header: 'First Name' },
    { key: 'last_name', header: 'Last Name' },
    { key: 'subject', header: 'Subject' },
    {
      key: 'status',
      header: 'Status',
      render: (teacher: any) => <StatusBadge status={teacher.status || 'active'} />
    },
  ];

  // Payment columns for the table
  const paymentColumns = [
    { key: 'payment_for', header: 'Payment For' },
    { key: 'student_name', header: 'Student' },
    {
      key: 'payment_date',
      header: 'Date',
      render: (payment: any) => payment.payment_date ? formatDate(payment.payment_date) : 'N/A'
    },
    { key: 'payment_method', header: 'Method' },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment: any) => `GHS ${parseFloat(payment.amount || 0).toFixed(2)}`
    },
  ];

  const attendanceRate = attendanceStats?.attendance_rate || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={studentStats?.total_students?.toString() || '0'}
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Teachers"
          value={teacherStats?.total_teachers?.toString() || '0'}
          icon={<FiUser className="w-6 h-6" />}
          color="green"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Classes"
          value={classStats?.total_classes?.toString() || '0'}
          icon={<FiBook className="w-6 h-6" />}
          color="purple"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate.toFixed(1)}%`}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="primary"
          trend={{ value: 0, isPositive: true }}
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
              <p className="text-lg font-bold">GHS {parseFloat(feeStats?.total_expected || 0).toLocaleString()}</p>
            </div>
            <div className="dashboard-subcard">
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-lg font-bold">GHS {parseFloat(feeStats?.total_collected || 0).toLocaleString()}</p>
            </div>
            <div className="dashboard-subcard">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-lg font-bold">GHS {parseFloat(feeStats?.outstanding || 0).toLocaleString()}</p>
            </div>
            <div className="dashboard-subcard">
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-lg font-bold">{feeStats?.collection_rate ? `${feeStats.collection_rate.toFixed(1)}%` : '0%'}</p>
            </div>
          </div>

          {/* Progress Bar Visualization */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Collection Progress</span>
              <span>{feeStats?.collection_rate ? `${feeStats.collection_rate.toFixed(1)}%` : '0%'}</span>
            </div>
            <div className="w-full bg-gray-100 border border-gray-200 rounded-full h-2.5">
              <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${feeStats?.collection_rate || 0}%` }}></div>
            </div>
          </div>

          <p className="text-sm text-gray-600">Target: 95% | {(feeStats?.collection_rate || 0) >= 95 ? 'Target achieved!' : 'Working towards goal'}</p>
        </div>

        <StudentsWithFeesCard />
      </div>

      {/* Recent Payments */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
        <DataTable columns={paymentColumns} data={recentPayments} />
      </div>
    </div>
  );
}

