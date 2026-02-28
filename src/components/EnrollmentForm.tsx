import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiCalendar, FiBook, FiCheckSquare } from 'react-icons/fi';
import { api } from '@/lib/api';
import { formatDateForInput, convertToISODate, formatDate, parseDate } from '@/lib/dateUtils';

interface EnrollmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  enrollment?: any; // Optional enrollment data for editing
}

interface StudentInfo {
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  parent_email?: string;
  guardian_full_name: string;
  guardian_phone: string;
  guardian_relationship?: string;
  additional_phones?: string[]; // Array for multiple phone numbers
  date_of_birth: string;
  class_id: string;
  enrollment_date: string;
  academic_year: string;
  email?: string;
  gender?: string; // 'male' | 'female'
  status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ isOpen, onClose, onSubmit, enrollment }) => {
  const [step, setStep] = useState(1);

  // Initialize student info based on whether we're editing or creating
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(
    enrollment
      ? {
          first_name: enrollment.first_name || enrollment.student_name?.split(' ')[0] || '',
          last_name: enrollment.last_name || enrollment.student_name?.split(' ').slice(1).join(' ') || '',
          phone: enrollment.phone || '',
          address: enrollment.address || '',
          parent_email: enrollment.parent_email || '',
          guardian_full_name: enrollment.guardian_full_name || enrollment.contact_name || '',
          guardian_phone: enrollment.guardian_phone || enrollment.phone || '',
          guardian_relationship: enrollment.guardian_relationship || '',
          additional_phones: enrollment.additional_phones || [],
          date_of_birth: enrollment.date_of_birth || '',
          class_id: enrollment.class_enrolled?.toString() || enrollment.class_id?.toString() || '',
          enrollment_date: enrollment.enrollment_date || new Date().toISOString().split('T')[0],
          academic_year: enrollment.academic_year || new Date().getFullYear().toString(),
          email: enrollment.student_email || enrollment.email || '',
          gender: enrollment.gender || 'male',
          emergency_contact_name: enrollment.emergency_contact_name || '',
          emergency_contact_phone: enrollment.emergency_contact_phone || '',
        }
      : {
          first_name: '',
          last_name: '',
          phone: '',
          address: '',
          parent_email: '',
          guardian_full_name: '',
          guardian_phone: '',
          guardian_relationship: '',
          additional_phones: [],
          date_of_birth: '',
          class_id: '',
          enrollment_date: new Date().toISOString().split('T')[0],
          academic_year: new Date().getFullYear().toString(),
          email: '',
          gender: 'male',
          emergency_contact_name: '',
          emergency_contact_phone: '',
        }
  );

  // Initialize checklist based on enrollment data or default
  const [initialChecklist] = useState<ChecklistItem[]>(
    enrollment?.checklist || [
      { id: '1', name: 'Student ID Card', completed: false },
      { id: '2', name: 'Textbooks', completed: false },
      { id: '3', name: 'Uniform', completed: false },
      { id: '4', name: 'Stationery', completed: false },
      { id: '5', name: 'Medical Records', completed: false },
    ]
  );

  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>(enrollment?.student?.toString() || '');
  const [term, setTerm] = useState<number>(enrollment?.term || 1);
  const [studentStatus, setStudentStatus] = useState<string>(enrollment?.status || 'active');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(enrollment?.profile_photo || '');
  const [requiredDocs, setRequiredDocs] = useState({
    birth_certificate: enrollment?.birth_certificate || false,
    report_card: enrollment?.report_card || false,
    medical_records: enrollment?.medical_records || false,
    passport_photo: enrollment?.passport_photo || false,
    parent_id: enrollment?.parent_id || false,
    fee_payment: enrollment?.fee_payment || false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('');

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classesData = await api.classes.list();
        setClasses(classesData.results || classesData);
      } catch (err) {
        setError('Failed to load classes');
        console.error('Error fetching classes:', err);
      }
    };

    const fetchStudents = async () => {
      try {
        const studentsData = await api.students.list();
        setStudents(studentsData.results || studentsData);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

    const fetchAcademicYears = async () => {
      try {
        // Fetch only active academic terms
        const termsData = await api.results.academicTerms.activeTerms();
        const terms = termsData.results || termsData;
        // Extract unique academic years from active terms
        const years: string[] = Array.from(
          new Set((terms as any[]).map((t: any) => String(t.academic_year)))
        );
        setAvailableAcademicYears(years.sort().reverse());
        
        // Set the first (most recent) active academic year
        if (years.length > 0) {
          setActiveAcademicYear(years[0]);
        }
      } catch (err) {
        console.error('Error fetching academic years:', err);
      }
    };

    if (isOpen) {
      setLoading(true);
      Promise.all([fetchClasses(), fetchStudents(), fetchAcademicYears()])
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Synchronize form state when enrollment prop changes
  useEffect(() => {
    if (enrollment && isOpen) {
      // Update all student info fields when enrollment changes (EDIT mode)
      setStudentInfo({
        first_name: enrollment.first_name || enrollment.student_name?.split(' ')[0] || '',
        last_name: enrollment.last_name || enrollment.student_name?.split(' ').slice(1).join(' ') || '',
        phone: enrollment.phone || '',
        address: enrollment.address || '',
        parent_email: enrollment.parent_email || '',
        guardian_full_name: enrollment.guardian_full_name || '',
        guardian_phone: enrollment.guardian_phone || '',
        guardian_relationship: enrollment.guardian_relationship || '',
        additional_phones: enrollment.additional_phones || [],
        date_of_birth: enrollment.student_date_of_birth || enrollment.date_of_birth || '',
        class_id: enrollment.class_enrolled?.toString() || enrollment.class_id?.toString() || '',
        enrollment_date: enrollment.enrollment_date || new Date().toISOString().split('T')[0],
        academic_year: enrollment.academic_year || new Date().getFullYear().toString(),
        email: enrollment.student_email || enrollment.email || '',
        gender: enrollment.student_gender || enrollment.gender || 'male',
        emergency_contact_name: enrollment.emergency_contact_name || '',
        emergency_contact_phone: enrollment.emergency_contact_phone || '',
      });
      setSelectedStudent(enrollment.student?.toString() || '');
      setTerm(enrollment.term || 1);
      setStudentStatus(enrollment.status || 'active');
      setPhotoFile(null);
      setPhotoPreview(enrollment.profile_photo || '');
      setRequiredDocs({
        birth_certificate: enrollment.birth_certificate || false,
        report_card: enrollment.report_card || false,
        medical_records: enrollment.medical_records || false,
        passport_photo: enrollment.passport_photo || false,
        parent_id: enrollment.parent_id || false,
        fee_payment: enrollment.fee_payment || false,
      });
      
      // Load checklist from enrollment data
      if (enrollment.checklist && Array.isArray(enrollment.checklist) && enrollment.checklist.length > 0) {
        setChecklist(enrollment.checklist);
      } else {
        // Use default checklist
        setChecklist([
          { id: '1', name: 'Student ID Card', completed: false },
          { id: '2', name: 'Textbooks', completed: false },
          { id: '3', name: 'Uniform', completed: false },
          { id: '4', name: 'Stationery', completed: false },
          { id: '5', name: 'Medical Records', completed: false },
        ]);
      }
    } else if (!enrollment && isOpen) {
      // Reset form to empty state when adding new enrollment (CREATE mode)
      setStudentInfo({
        first_name: '',
        last_name: '',
        guardian_full_name: '',
        guardian_phone: '',
        guardian_relationship: '',
        additional_phones: [],
        date_of_birth: '',
        class_id: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        academic_year: activeAcademicYear || new Date().getFullYear().toString(),
        email: '',
        gender: 'male',
        emergency_contact_name: '',
        emergency_contact_phone: '',
      });
      setSelectedStudent('');
      setTerm(1);
      setStudentStatus('active');
      setPhotoFile(null);
      setPhotoPreview('');
      setRequiredDocs({
        birth_certificate: false,
        report_card: false,
        medical_records: false,
        passport_photo: false,
        parent_id: false,
        fee_payment: false,
      });
      setChecklist([
        { id: '1', name: 'Student ID Card', completed: false },
        { id: '2', name: 'Textbooks', completed: false },
        { id: '3', name: 'Uniform', completed: false },
        { id: '4', name: 'Stationery', completed: false },
        { id: '5', name: 'Medical Records', completed: false },
      ]);
      setStep(1);
    }
  }, [enrollment, isOpen, activeAcademicYear]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Calculate completion percentage based on both checklists:
  // 1. General checklist items (top)
  // 2. Required documents (bottom)
  const generalChecklistCompleted = checklist.filter(item => item.completed).length;
  const generalChecklistTotal = checklist.length;
  const requiredDocsCompleted = Object.values(requiredDocs).filter(v => v).length;
  const requiredDocsTotal = Object.keys(requiredDocs).length;
  
  const totalCompleted = generalChecklistCompleted + requiredDocsCompleted;
  const totalItems = generalChecklistTotal + requiredDocsTotal;
  const completionPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleChecklistChange = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate only Step 1 fields (enrollment data), not checklist
    if (!studentInfo.class_id || !studentInfo.academic_year) {
      setError('Please fill in all required fields: first name, last name, guardian name, guardian phone, class, and academic year.');
      return;
    }

    // Validate required student fields before submitting
    if (!selectedStudent && (!studentInfo.first_name || !studentInfo.last_name || !studentInfo.date_of_birth || !studentInfo.guardian_full_name || !studentInfo.guardian_phone)) {
      setError('Please fill in all required fields: first name, last name, date of birth, guardian name, and guardian phone.');
      return;
    }

    try {
      // Get the student ID - handle both object and ID formats
      const getStudentId = () => {
        if (selectedStudent) {
          return selectedStudent;
        }
        if (enrollment?.student) {
          return typeof enrollment.student === 'object' ? (enrollment.student as any).id : enrollment.student;
        }
        return null;
      };

      const studentId = getStudentId();

      // Prepare payload expected by backend Enrollment endpoint
      const enrollmentPayload = {
        student: studentId, // required: student ID
        class_enrolled: studentInfo.class_id, // required: class ID
        academic_year: studentInfo.academic_year, // required: string e.g. "2025-2026"
        term: term || enrollment?.term, // required: 1 | 2 | 3
        guardian_full_name: studentInfo.guardian_full_name,
        guardian_phone: studentInfo.guardian_phone,
        guardian_relationship: studentInfo.guardian_relationship,
        // general checklist items
        checklist: checklist,
        // document flags
        ...requiredDocs,
        // optional flags default on backend; not sent here
      };

      // When editing an existing student (not creating new enrollment),
      // we should only update the enrollment if specific enrollment fields have changed
      let createdStudentId: string | null = null;

      // Check if status changed (needed for both editing and creating)
      const statusChanged = studentStatus !== (enrollment?.status || 'active');

      if (enrollment && enrollment.id) {
        // Check if enrollment-specific fields have changed
        const hasEnrollmentChanges =
          studentInfo.class_id !== (enrollment.class_enrolled?.id || enrollment.class_id) ||
          studentInfo.academic_year !== enrollment.academic_year ||
          term !== enrollment.term ||
          studentInfo.guardian_full_name !== (enrollment.guardian_full_name || enrollment.contact_name) ||
          studentInfo.guardian_phone !== (enrollment.guardian_phone || enrollment.phone) ||
          studentInfo.guardian_relationship !== enrollment.guardian_relationship ||
          requiredDocs.birth_certificate !== enrollment.birth_certificate ||
          requiredDocs.report_card !== enrollment.report_card ||
          requiredDocs.medical_records !== enrollment.medical_records ||
          requiredDocs.passport_photo !== enrollment.passport_photo ||
          requiredDocs.parent_id !== enrollment.parent_id ||
          requiredDocs.fee_payment !== enrollment.fee_payment;

        console.log('Enrollment Changes Check:', {
          hasEnrollmentChanges,
          class_id: { current: studentInfo.class_id, existing: enrollment.class_enrolled?.id || enrollment.class_id },
          guardian_relationship: { current: studentInfo.guardian_relationship, existing: enrollment.guardian_relationship },
          enrollment
        });

        // Check if student name fields have changed
        const studentNameChanged = 
          studentInfo.first_name !== (enrollment.student?.first_name || '') ||
          studentInfo.last_name !== (enrollment.student?.last_name || '');

        // Check if guardian info changed
        const guardianChanged =
          studentInfo.guardian_full_name !== (enrollment.guardian_full_name || '') ||
          studentInfo.guardian_phone !== (enrollment.guardian_phone || '');

        if (hasEnrollmentChanges) {
          // Only update enrollment if we have a valid enrollment ID
          if (enrollment.id) {
            // Extract student ID - handle both object and ID formats
            let studentId = null;
            if (enrollment.student) {
              studentId = typeof enrollment.student === 'object' ? enrollment.student.id : enrollment.student;
            } else if (selectedStudent) {
              studentId = selectedStudent;
            } else if (enrollment.student_id) {
              studentId = enrollment.student_id;
            } else if (enrollment.student_id_number) {
              studentId = enrollment.student_id_number;
            }
            
            // Update existing enrollment - ensure student field is just the ID
            const updatedEnrollmentPayload = {
              ...enrollmentPayload,
              student: studentId,
            };
            await api.enrollments.update(enrollment.id, updatedEnrollmentPayload);
          } else {
            console.warn('No enrollment ID found - skipping enrollment update. This may be a student edit without enrollment context.');
          }
        }

        // Update student data if name, guardian, or status changed
        if (studentNameChanged || guardianChanged || statusChanged) {
          const studentUpdatePayload: any = {};
          if (studentInfo.first_name !== (enrollment.student?.first_name || '')) {
            studentUpdatePayload.first_name = studentInfo.first_name;
          }
          if (studentInfo.last_name !== (enrollment.student?.last_name || '')) {
            studentUpdatePayload.last_name = studentInfo.last_name;
          }
          if (studentStatus !== (enrollment?.status || 'active')) {
            studentUpdatePayload.status = studentStatus;
          }
          
          // Update parent_name if guardian_full_name changed
          if (studentInfo.guardian_full_name !== (enrollment.guardian_full_name || '')) {
            studentUpdatePayload.parent_name = studentInfo.guardian_full_name;
          }
          // Update parent_phone if guardian_phone changed
          if (studentInfo.guardian_phone !== (enrollment.guardian_phone || '')) {
            studentUpdatePayload.parent_phone = studentInfo.guardian_phone;
          }
          // Update parent_relationship if guardian_relationship changed
          if (studentInfo.guardian_relationship !== (enrollment.guardian_relationship || '')) {
            studentUpdatePayload.parent_relationship = studentInfo.guardian_relationship;
          }

          if (Object.keys(studentUpdatePayload).length > 0) {
            const studentId = enrollment.student?.id || enrollment.student;
            if (studentId) {
              await api.students.update(studentId, studentUpdatePayload);
            }
          }
        }
      } else if (selectedStudent) {
        // Create enrollment for existing student
        const updatedEnrollmentPayload = {
          ...enrollmentPayload,
          student: selectedStudent,
        };
        await api.enrollments.create(updatedEnrollmentPayload);
      } else {
        // Create student and enrollment together
        const combinedPayload: any = {
          // Required student fields
          first_name: studentInfo.first_name,
          last_name: studentInfo.last_name,
          date_of_birth: studentInfo.date_of_birth,
          guardian_full_name: studentInfo.guardian_full_name,
          guardian_phone: studentInfo.guardian_phone,
          // Required enrollment fields
          class_id: studentInfo.class_id,
          academic_year: studentInfo.academic_year,
          term,
          // Optional fields
          parent_relationship: studentInfo.guardian_relationship || '',
          email: (studentInfo.email && studentInfo.email.trim()) ? studentInfo.email.trim() : null,
          gender: studentInfo.gender || 'male',
          status: studentStatus,
          emergency_contact_name: studentInfo.emergency_contact_name || '',
          emergency_contact_phone: studentInfo.emergency_contact_phone || '',
          phone: studentInfo.guardian_phone,
          address: '',
          // Checklist items
          checklist: checklist,
          // Document flags
          ...requiredDocs,
        };
        
        let createResponse: any;
        if (photoFile) {
          // Only use FormData when we have a photo file
          const formPayload = new FormData();
          Object.entries(combinedPayload).forEach(([key, value]) => {
            // Send all values, even empty strings, for required fields
            if (value !== undefined && value !== null) {
              // Serialize arrays and objects as JSON
              if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                formPayload.append(key, JSON.stringify(value));
              } else {
                formPayload.append(key, String(value));
              }
            }
          });
          formPayload.append('profile_photo', photoFile);
          createResponse = await api.enrollments.createWithStudent(formPayload);
        } else {
          // Use JSON for cleaner data transmission when no file upload
          createResponse = await api.enrollments.createWithStudent(combinedPayload);
        }
        createdStudentId = createResponse?.student?.id || null;
      }

      const resolvedStudentId = createdStudentId || studentId;
      const needsPhotoUpdate = photoFile && enrollment && enrollment.id;
      
      // For new enrollments (not editing), update student if needed
      if (!enrollment && resolvedStudentId && (statusChanged || needsPhotoUpdate)) {
        if (needsPhotoUpdate) {
          const formPayload = new FormData();
          if (studentStatus) {
            formPayload.append('status', studentStatus);
          }
          formPayload.append('profile_photo', photoFile);
          await api.students.update(resolvedStudentId, formPayload);
        } else if (statusChanged && !photoFile) {
          await api.students.update(resolvedStudentId, { status: studentStatus });
        }
      }

      // Prepare data for parent component - include both enrollment and student data
      const resultData = {
        // Student data
        first_name: studentInfo.first_name,
        last_name: studentInfo.last_name,
        date_of_birth: studentInfo.date_of_birth,
        email: studentInfo.email,
        gender: studentInfo.gender,
        phone: studentInfo.phone || studentInfo.guardian_phone,
        address: studentInfo.address,
        class_id: studentInfo.class_id,
        parent_email: studentInfo.parent_email,
        emergency_contact_name: studentInfo.emergency_contact_name,
        emergency_contact_phone: studentInfo.emergency_contact_phone,
        status: studentStatus,
        profile_photo: photoFile ? photoFile : (photoPreview || undefined),
        // Enrollment data (if needed)
        ...enrollmentPayload,
        id: enrollment?.id,
        ui: {
          student_name: `${studentInfo.first_name} ${studentInfo.last_name}`,
          contact_name: studentInfo.guardian_full_name,
          class_name: classes.find(c => c.id === studentInfo.class_id)?.name || '',
          status: 'pending', // No longer based on checklist completion
          checklist: [], // Checklist can be completed later
          completion_percentage: completionPercentage,
        },
      };

      // Still notify parent with combined UI state if needed
      await onSubmit(resultData);

      // Reset form and close
      setStep(1);
      if (!enrollment) {
        // Only reset if we're not editing
        setStudentInfo({
          first_name: '',
          last_name: '',
          phone: '',
          address: '',
          parent_email: '',
          guardian_full_name: '',
          guardian_phone: '',
          additional_phones: [],
          date_of_birth: '',
          class_id: '',
          enrollment_date: new Date().toISOString().split('T')[0],
          academic_year: new Date().getFullYear().toString(),
        });
        setChecklist(initialChecklist);
      }
      onClose();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to save enrollment';
      console.error('Full error saving enrollment:', err);
      console.error('Error details:', err?.response || err);
      setError(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">
            {enrollment ? 'Edit Enrollment' : 'Student Information'} - {step === 1 ? 'Step 1' : 'Step 2'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {step} of 2</span>
            <span>{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={studentInfo.first_name}
                      onChange={handleInputChange}
                      className="input-field pl-10 w-full"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={studentInfo.last_name}
                      onChange={handleInputChange}
                      className="input-field pl-10 w-full"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="guardian_full_name"
                    value={studentInfo.guardian_full_name}
                    onChange={handleInputChange}
                    className="input-field pl-10 w-full"
                    placeholder="Enter guardian's full name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      name="guardian_phone"
                      value={studentInfo.guardian_phone}
                      onChange={handleInputChange}
                      className="input-field pl-10 w-full"
                      placeholder="Enter guardian's phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian Relationship
                  </label>
                  <div className="relative">
                    <select
                      name="guardian_relationship"
                      value={studentInfo.guardian_relationship}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="">Select relationship</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="uncle">Uncle</option>
                      <option value="aunt">Aunt</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={studentInfo.email || ''}
                      onChange={handleInputChange}
                      className="input-field pl-10 w-full"
                      placeholder="Enter email (optional)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={studentInfo.gender || 'male'}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Status</label>
                  <div className="relative">
                    <select
                      value={studentStatus}
                      onChange={(e) => setStudentStatus(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (photoPreview && photoPreview.startsWith('blob:')) {
                          URL.revokeObjectURL(photoPreview);
                        }
                        setPhotoFile(file);
                        setPhotoPreview(file ? URL.createObjectURL(file) : (enrollment?.profile_photo || ''));
                      }}
                      className="block w-full text-sm text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Phone Numbers Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Phone Numbers
                </label>
                {studentInfo.additional_phones?.map((phone, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div className="relative flex-1 mr-2">
                      <FiPhone className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const updatedPhones = [...studentInfo.additional_phones!];
                          updatedPhones[index] = e.target.value;
                          setStudentInfo(prev => ({ ...prev, additional_phones: updatedPhones }));
                        }}
                        className="input-field pl-10 w-full"
                        placeholder="Enter additional phone number"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedPhones = [...studentInfo.additional_phones!];
                        updatedPhones.splice(index, 1);
                        setStudentInfo(prev => ({ ...prev, additional_phones: updatedPhones }));
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setStudentInfo(prev => ({
                      ...prev,
                      additional_phones: [...(prev.additional_phones || []), '']
                    }));
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm mt-1"
                >
                  + Add Phone Number
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <div className="relative">
                    {loading ? (
                      <div className="input-field w-full">Loading...</div>
                    ) : (
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="">Select a student (optional)</option>
                        {students.map(st => (
                          <option key={st.id} value={st.id}>
                            {st.full_name || `${st.first_name} ${st.last_name}`} ({st.student_id})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formatDateForInput(studentInfo.date_of_birth)}
                      onChange={(e) => setStudentInfo({...studentInfo, date_of_birth: convertToISODate(e.target.value)})}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  {studentInfo.date_of_birth && (
                    <p className="text-xs text-gray-600 mt-1">Selected: {formatDate(studentInfo.date_of_birth)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <div className="relative">
                    <FiBook className="absolute left-3 top-3 text-gray-400" />
                    {loading ? (
                      <div className="input-field pl-10 w-full">Loading...</div>
                    ) : (
                      <select
                        name="class_id"
                        value={studentInfo.class_id}
                        onChange={handleInputChange}
                        className="input-field pl-10 w-full"
                        required
                      >
                        <option value="">Select a class</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      name="enrollment_date"
                      value={formatDateForInput(studentInfo.enrollment_date)}
                      onChange={(e) => setStudentInfo({...studentInfo, enrollment_date: convertToISODate(e.target.value)})}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  {studentInfo.enrollment_date && (
                    <p className="text-xs text-gray-600 mt-1">Selected: {formatDate(studentInfo.enrollment_date)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                    <select
                      name="academic_year"
                      value={studentInfo.academic_year}
                      onChange={handleInputChange}
                      className="input-field pl-10 w-full"
                      required
                    >
                      <option value="">Select Academic Year</option>
                      {availableAcademicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                    <select
                      value={term}
                      onChange={(e) => setTerm(Number(e.target.value))}
                      className="input-field pl-10 w-full"
                      required
                    >
                      <option value={1}>First Term</option>
                      <option value={2}>Second Term</option>
                      <option value={3}>Third Term</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">New Student Checklist</h4>
                  <span className="text-sm text-gray-600">{completionPercentage}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      id={`checklist-${item.id}`}
                      checked={item.completed}
                      onChange={() => handleChecklistChange(item.id)}
                      className="h-4 w-4 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <label
                      htmlFor={`checklist-${item.id}`}
                      className={`ml-3 flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                    >
                      {item.name}
                    </label>
                    <FiCheckSquare className={`w-5 h-5 ${item.completed ? 'text-green-600' : 'text-gray-300'}`} />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'birth_certificate', label: 'Birth Certificate' },
                    { key: 'report_card', label: 'Report Card' },
                    { key: 'medical_records', label: 'Medical Records' },
                    { key: 'passport_photo', label: 'Passport Photo' },
                    { key: 'parent_id', label: 'Parent ID' },
                    { key: 'fee_payment', label: 'Fee Payment' },
                  ].map(doc => (
                    <label key={doc.key} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(requiredDocs as any)[doc.key]}
                        onChange={(e) => setRequiredDocs(prev => ({ ...prev, [doc.key]: e.target.checked }))}
                        className="h-4 w-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <span className="ml-3 text-gray-700">{doc.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <div className="ml-auto flex space-x-3">
              {step === 1 && (
                <>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {enrollment ? 'Update Enrollment' : 'Enroll Student'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    View Documents (Optional)
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentForm;