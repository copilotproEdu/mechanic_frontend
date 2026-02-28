'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import EnrollmentForm from '@/components/EnrollmentForm';
import { FiUser, FiUsers, FiMail, FiPhone, FiBook, FiCheckCircle, FiUserPlus, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';
import { Student } from '@/types';
import { formatDate } from '@/lib/dateUtils';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('');
  const [studentEnrollment, setStudentEnrollment] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchActiveAcademicYear();
  }, []);

  const fetchActiveAcademicYear = async () => {
    try {
      const activeTerms = await api.results.academicTerms.activeTerms();
      if (activeTerms && activeTerms.length > 0) {
        setActiveAcademicYear(activeTerms[0].academic_year);
      } else {
        // Fallback to current year format if no active term
        const currentYear = new Date().getFullYear();
        setActiveAcademicYear(`${currentYear}-${currentYear + 1}`);
      }
    } catch (error) {
      console.error('Failed to fetch active academic year:', error);
      // Fallback to current year format
      const currentYear = new Date().getFullYear();
      setActiveAcademicYear(`${currentYear}-${currentYear + 1}`);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, statsData] = await Promise.all([
        api.students.list(),
        api.students.statistics()
      ]);
      
      setStudents(studentsData.results || studentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students
    .filter(student =>
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Get class names
      const classA = (a.class_name || '').toLowerCase();
      const classB = (b.class_name || '').toLowerCase();

      // Define priority order: Creche, Kindergarten, then others by number
      const getPriority = (className: string) => {
        if (className.includes('creche') || className.includes('crèche') || className.includes('crèche')) {
          return 0; // Creche first
        } else if (className.includes('kindergarten') || className.includes('kg') || className.includes('nursery')) {
          return 1; // Kindergarten second
        } else {
          return 2; // Others come after
        }
      };

      const priorityA = getPriority(classA);
      const priorityB = getPriority(classB);

      // If priorities are different, sort by priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If both have same priority, sort by class name
      // For numbered classes, extract numbers and sort numerically
      if (priorityA === 2) { // For other classes, try to sort by numbers
        const numA = parseInt(classA.match(/\d+/)?.[0] || '0');
        const numB = parseInt(classB.match(/\d+/)?.[0] || '0');

        if (!isNaN(numA) && !isNaN(numB)) {
          if (numA !== numB) {
            return numA - numB;
          }
        }
      }

      // If numbers are the same or not applicable, sort alphabetically
      const classComparison = classA.localeCompare(classB);

      // If classes are the same, sort by last name (surname)
      if (classComparison === 0) {
        const lastNameA = a.last_name || '';
        const lastNameB = b.last_name || '';
        return lastNameA.localeCompare(lastNameB);
      }

      return classComparison;
    });

  const columns = [
    {
      key: 'rowNumber',
      header: '#',
      render: (student: any) => student.rowNumber
    },
    { 
      key: 'full_name', 
      header: 'Student Name'
    },
    { key: 'phone', header: 'Phone' },
    {
      key: 'class_name',
      header: 'Class',
      render: (student: any) => student.class_name || 'N/A'
    },
    { 
      key: 'enrollment_date', 
      header: 'Enrollment Date',
      render: (student: any) => student.enrollment_date ? formatDate(student.enrollment_date) : 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      render: (student: any) => <StatusBadge status={student.status} />
    },
    {
      key: 'parent_name',
      header: 'Parent/Guardian',
      render: (student: any) => {
        const parentName = student.parent_name || student.parent_guardian_name || 'N/A';
        const relationship = student.parent_relationship;
        return (
          <div>
            <div>{parentName}</div>
            {relationship ? (
              <div className="text-xs text-gray-500">{relationship}</div>
            ) : (
              <div className="text-xs text-gray-500 text-gray-400">No relationship specified</div>
            )}
          </div>
        );
      }
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={stats?.total_students?.toString() || '0'}
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Students"
          value={stats?.active_students?.toString() || '0'}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Inactive Students"
          value={stats?.inactive_students?.toString() || '0'}
          icon={<FiUser className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Graduated"
          value={stats?.graduated_students?.toString() || '0'}
          icon={<FiUser className="w-6 h-6" />}
          color="primary"
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredStudents.map((student, index) => ({
            ...student,
            rowNumber: index + 1
          }))}
          onRowClick={(student) => {
            setSelectedStudent(student);
            setShowStudentDetailsModal(true);
          }}
        />
      </div>
      {/* Student Details Modal */}
      {showStudentDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiUser className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Student Details</h3>
                  <p className="text-sm text-gray-500">Full student information</p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Student Summary Card - Centered with minimal background */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm inline-block">
                  <div className="flex items-center text-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-100 bg-white flex items-center justify-center flex-shrink-0">
                      {selectedStudent.profile_photo ? (
                        <img
                          src={selectedStudent.profile_photo}
                          alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <h4 className="text-base font-bold text-gray-800">
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedStudent.class_name || 'N/A'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedStudent.student_id || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-blue-600 flex items-center">
                    <FiUser className="mr-2" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">First Name</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.first_name || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Last Name</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.last_name || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-gray-900 font-medium mt-1">
                        {selectedStudent.email && !selectedStudent.email.includes('@students.local') && selectedStudent.email.trim()
                          ? selectedStudent.email
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.phone || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.date_of_birth ? formatDate(selectedStudent.date_of_birth) : 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.gender || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-blue-600 flex items-center">
                    <FiBook className="mr-2" /> Academic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.student_id || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Class</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.class_name || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                      <p className="text-gray-900 font-medium mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedStudent.status === 'inactive' ? 'bg-primary-100 text-primary-800' :
                          selectedStudent.status === 'graduated' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedStudent.status || 'N/A'}
                        </span>
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Enrollment Date</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.enrollment_date ? formatDate(selectedStudent.enrollment_date) : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-blue-600 flex items-center">
                    <FiUser className="mr-2" /> Parent/Guardian Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Parent Name</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.parent_name || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Parent Phone</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.parent_phone || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Parent Email</p>
                      <p className="text-gray-900 font-medium mt-1">
                        {selectedStudent.parent_email && !selectedStudent.parent_email.includes('@students.local')
                          ? selectedStudent.parent_email
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Relationship</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedStudent.parent_relationship ? selectedStudent.parent_relationship : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowStudentDetailsModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    // Fetch the actual enrollment for this student
                    try {
                      const enrollments = await api.enrollments.list();
                      const studentEnrollmentRecord = enrollments.results?.find(
                        (e: any) => e.student === selectedStudent?.id || e.student?.id === selectedStudent?.id
                      );
                      setStudentEnrollment(studentEnrollmentRecord || null);
                    } catch (error) {
                      console.error('Failed to fetch student enrollment:', error);
                      setStudentEnrollment(null);
                    }
                    setShowStudentDetailsModal(false);
                    setShowEnrollmentModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#ffe600] text-gray-900 rounded-lg hover:bg-[#f5dc00] transition-colors flex items-center"
                >
                  <FiUser className="mr-2" /> Edit Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Form Modal for editing student */}
      <EnrollmentForm
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false);
          setShowStudentDetailsModal(true); // Reopen the student details modal if needed
        }}
        onSubmit={async (formData) => {
          // Handle the submission of updated student data
          try {
            // If this is an existing student, update the student record
            if (selectedStudent?.id) {
              // Map the form data to student fields - include ALL required fields
              const studentUpdateData = {
                first_name: formData.first_name || selectedStudent.first_name,
                last_name: formData.last_name || selectedStudent.last_name,
                email: formData.email || selectedStudent.email || null,
                phone: formData.phone || selectedStudent.phone || '',
                date_of_birth: formData.date_of_birth || selectedStudent.date_of_birth,
                gender: formData.gender || selectedStudent.gender,
                address: formData.address || selectedStudent.address || '',
                current_class: formData.class_id || selectedStudent.current_class?.id || null,
                parent_name: formData.guardian_full_name || selectedStudent.parent_name,
                parent_phone: formData.guardian_phone || selectedStudent.parent_phone,
                parent_relationship: formData.guardian_relationship || selectedStudent.parent_relationship || '',
                parent_email: formData.parent_email || selectedStudent.parent_email || '',
                emergency_contact_name: formData.emergency_contact_name || selectedStudent.emergency_contact_name || '',
                emergency_contact_phone: formData.emergency_contact_phone || selectedStudent.emergency_contact_phone || '',
                status: formData.status || selectedStudent.status,
                academic_year: formData.academic_year || selectedStudent.academic_year || '',
              };

              const hasPhoto = formData?.profile_photo instanceof File;
              let updatedStudent: any;
              if (hasPhoto) {
                const formPayload = new FormData();
                Object.entries(studentUpdateData).forEach(([key, value]) => {
                  if (value !== undefined && value !== null) {
                    formPayload.append(key, String(value));
                  }
                });
                formPayload.append('profile_photo', formData.profile_photo as File);
                console.log('Updating student with photo');
                updatedStudent = await api.students.update(selectedStudent.id, formPayload);
              } else {
                console.log('Updating student without photo');
                updatedStudent = await api.students.update(selectedStudent.id, studentUpdateData);
              }
              // Update the local state
              setStudents(prev =>
                prev.map(student =>
                  student.id === selectedStudent.id ? updatedStudent : student
                )
              );
              // Update selected student so details modal shows new data
              setSelectedStudent(updatedStudent);
            }
            setShowEnrollmentModal(false);
            setShowStudentDetailsModal(false); // Close the details modal as well
          } catch (error) {
            console.error('Error updating student:', error);
          }
        }}
        enrollment={selectedStudent ? (studentEnrollment ? {
          ...studentEnrollment,
          student: selectedStudent,
          first_name: selectedStudent.first_name,
          last_name: selectedStudent.last_name,
        } : {
          ...selectedStudent,
          first_name: selectedStudent.first_name,
          last_name: selectedStudent.last_name,
          guardian_full_name: selectedStudent.parent_name,
          guardian_phone: selectedStudent.parent_phone,
          guardian_relationship: selectedStudent.parent_relationship,
          date_of_birth: selectedStudent.date_of_birth,
          class_id: selectedStudent.current_class?.id || selectedStudent.current_class,
          enrollment_date: selectedStudent.enrollment_date,
          academic_year: selectedStudent.academic_year || activeAcademicYear,
          email: selectedStudent.email,
          gender: selectedStudent.gender,
          status: selectedStudent.status,
          profile_photo: selectedStudent.profile_photo,
          emergency_contact_name: selectedStudent.emergency_contact_name,
          emergency_contact_phone: selectedStudent.emergency_contact_phone,
          parent_email: selectedStudent.parent_email,
          student: selectedStudent.id,
        }) : null}
      />

    </div>
  );
}

