'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiBook, FiCheckSquare, FiSave, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import EnrollmentForm from '@/components/EnrollmentForm';
import { formatDate } from '@/lib/dateUtils';

export default function EnrollmentPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState<any>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setError(null);
      setLoading(true);
      const enrollmentsData = await api.enrollments.list();

      // Process the enrollment data to ensure all required fields are present
      let processedEnrollments = (enrollmentsData.results || enrollmentsData).map((enrollment: any) => ({
        ...enrollment,
        checklist: enrollment.checklist || [],
        completion_percentage: enrollment.completion_percentage || 0,
        status: enrollment.status || 'pending',
      }));

      // Deduplicate: Keep only the latest enrollment per student
      // Sort by created_at descending to get most recent first
      processedEnrollments.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      // Keep track of seen students and filter out duplicates
      const seenStudents = new Set<number>();
      const deduplicatedEnrollments = processedEnrollments.filter((enrollment: any) => {
        if (seenStudents.has(enrollment.student)) {
          return false; // Skip duplicate
        }
        seenStudents.add(enrollment.student);
        return true;
      });

      setEnrollments(deduplicatedEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError(`Failed to fetch enrollments: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count only new student enrollments (not promotions)
  const newStudentsCount = enrollments.filter(
    enrollment => enrollment.enrollment_type === 'new' || !enrollment.enrollment_type
  ).length;

  const openEnrollmentDetail = (enrollment: any) => {
    setCurrentEnrollment(enrollment);
    setShowEnrollmentModal(true);
  };

  const columns = [
    {
      key: 'open_button',
      header: 'Actions',
      render: (enrollment: any) => (
        <button
          onClick={() => openEnrollmentDetail(enrollment)}
          className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-3 py-1 rounded text-sm flex items-center"
        >
          <FiUser className="w-3 h-3 mr-1" />
          Open
        </button>
      ),
    },
    { key: 'student_name', header: 'Student Name' },
    { key: 'student_phone', header: 'Phone' },
    { key: 'class_name', header: 'Class' },
    { 
      key: 'enrollment_date', 
      header: 'Enrollment Date',
      render: (enrollment: any) => enrollment.enrollment_date ? formatDate(enrollment.enrollment_date) : 'N/A'
    },
    {
      key: 'completion_percentage',
      header: 'Completion',
      render: (enrollment: any) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${enrollment.completion_percentage || 0}%` }}
            ></div>
          </div>
          <span className="text-sm">{enrollment.completion_percentage || 0}%</span>
        </div>
      )
    },
    { key: 'academic_year', header: 'Academic Year' },
    {
      key: 'status',
      header: 'Status',
      render: (enrollment: any) => <StatusBadge status={enrollment.status || 'pending'} />
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enrollments...</p>
        </div>
      </div>
    );
  }

  const handleEnrollmentSubmit = async (enrollmentData: any) => {
    try {
      // After enrollment is created or updated on the backend,
      // refetch the enrollments to get the latest data from the API
      // This ensures all fields including student_email, student_phone, completion_percentage are populated
      await fetchEnrollments();
      
      setShowEnrollmentModal(false);
      setCurrentEnrollment(null); // Reset current enrollment after submission
    } catch (error) {
      console.error('Error submitting enrollment:', error);
    }
  };

  return (
    <div>
      {/* Enrollments Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">All Enrollments</h3>
            <p className="text-sm text-gray-600 mt-1">
              Total: {filteredEnrollments.length} | New Students: {newStudentsCount}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search enrollments..."
              className="input-field w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                setCurrentEnrollment(null);
                setShowEnrollmentModal(true);
              }}
              className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap"
            >
              <FiUser className="w-4 h-4" />
              <span>Add New Pupil</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-primary-100 text-primary-700 rounded-lg">
            {error}
          </div>
        )}

        <DataTable columns={columns} data={filteredEnrollments} />
      </div>

      {/* Enrollment Form Modal */}
      <EnrollmentForm
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onSubmit={handleEnrollmentSubmit}
        enrollment={currentEnrollment}
      />
    </div>
  );
}
