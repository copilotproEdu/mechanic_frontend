'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiDollarSign, FiUsers, FiTrendingUp, FiTrendingDown, FiFileText, FiPlus, FiAlertCircle, FiX, FiCheck } from 'react-icons/fi';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';

type FeeType = 'school' | 'feeding';

export default function FeesPage() {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<any[]>([]);
  const [feeStats, setFeeStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecordFeeModal, setShowRecordFeeModal] = useState(false);
  const [showOwersModal, setShowOwersModal] = useState(false);
  const [feeType, setFeeType] = useState<FeeType>('school');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedFeedingFeeId, setSelectedFeedingFeeId] = useState<string>('');
  const [availableFeedingFees, setAvailableFeedingFees] = useState<any[]>([]);
  const [issuedDates, setIssuedDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<{[key: string]: boolean}>({});
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [studentFeeDetails, setStudentFeeDetails] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<{[key: string]: boolean}>({});
  const [owersFeeType, setOwersFeeType] = useState<FeeType>('school');
  const [owersClass, setOwersClass] = useState<string>('');
  const [owersList, setOwnersList] = useState<any[]>([]);
  const [paidDatesByStudent, setPaidDatesByStudent] = useState<{[key: string]: string[]}>({});

  useEffect(() => {
    fetchFees();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (showRecordFeeModal && feeType === 'school' && selectedStudent && selectedTerm) {
      fetchStudentFeeDetails();
    }
  }, [selectedStudent, selectedTerm, feeType]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      
      // Fetch both school fees and feeding fees
      const [schoolFeesData, studentFeedingFeesData, statsData] = await Promise.all([
        api.fees.studentFees.list({ page_size: 100 }),
        api.fees.studentFeedingFees.list({ page_size: 100 }),
        api.fees.studentFees.statistics()
      ]);

      // Format school fees with type indicator - only include fees with payments
      const schoolFees = (schoolFeesData.results || schoolFeesData)
        .filter((fee: any) => parseFloat(fee.amount_paid || 0) > 0)
        .map((fee: any) => ({
          ...fee,
          fee_type: 'School',
          fee_type_badge: 'school',
          // Use the serializer fields directly
          student_name: fee.student_name || `Student ${fee.student}`,
          class_name: fee.class_name || 'N/A'
        }));

      // Format feeding fees with type indicator - only include fees with payments
      const feedingFees = (studentFeedingFeesData.results || studentFeedingFeesData)
        .filter((fee: any) => parseFloat(fee.amount_paid || 0) > 0)
        .map((fee: any) => ({
          ...fee,
          fee_type: 'Feeding',
          fee_type_badge: 'feeding',
          // Use the serializer fields directly
          student_name: fee.student_name || `Student ${fee.student}`,
          class_name: fee.class_name || 'N/A',
          due_date: fee.due_date,
          balance: fee.balance || (fee.amount_due - fee.amount_paid - fee.discount)
        }));

      // Combine and sort by most recent
      const allFees = [...schoolFees, ...feedingFees].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setFees(allFees);
      setFeeStats(statsData);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const classesData = await api.classes.list({ page_size: 100 });
      setClasses(classesData.results || classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentsByClass = async (classId: string) => {
    try {
      // Convert string ID to number if needed
      const classIdNum = typeof classId === 'string' ? parseInt(classId) : classId;
      const studentsData = await api.classes.students(classIdNum.toString());
      const studentsList = studentsData.results || studentsData;
      setStudents(studentsList);
      
      // Debug: Check what fees exist for students in this class
      console.log(`Students in class ${classIdNum}:`, studentsList);
      const studentIds = studentsList.map((s: any) => s.id);
      
      // Fetch all student fees for debugging
      const allFeesData = await api.fees.studentFees.list({ page_size: 1000 });
      const allFees = allFeesData.results || allFeesData;
      const classFeesCount = allFees.filter((f: any) => studentIds.includes(f.student)).length;
      console.log(`Fees attached to students in this class:`, classFeesCount, allFees.filter((f: any) => studentIds.includes(f.student)));
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchAvailableFeedingFees = async () => {
    try {
      const feedingFeesData = await api.fees.feedingFees.list({ page_size: 100 });
      const fees = feedingFeesData.results || feedingFeesData;
      setAvailableFeedingFees(fees);
    } catch (error) {
      console.error('Error fetching feeding fees:', error);
      setAvailableFeedingFees([]);
    }
  };

  const handleFeedingFeeSelect = (feedingFeeId: string) => {
    setSelectedFeedingFeeId(feedingFeeId);
    const selectedFee = availableFeedingFees.find(f => f.id === parseInt(feedingFeeId));
    if (selectedFee && selectedFee.issued_dates) {
      const dates = selectedFee.issued_dates.split(',').map((d: string) => d.trim());
      setIssuedDates(dates);
      setSelectedDates({});
    }
  };

  const fetchPaidDatesForStudent = async (studentId: string, feedingFeeId: string) => {
    try {
      // Fetch all feeding fee payments for this student and feeding fee
      const paymentsData = await api.fees.feedingFeePayments.list({
        student_feeding_fee__student: studentId,
        student_feeding_fee__feeding_fee: feedingFeeId,
        page_size: 1000
      });

      const payments = paymentsData.results || paymentsData;
      console.log(`Fetched ${payments.length} payments for student ${studentId}`);

      // Extract all dates paid by this student
      const paidDates: Set<string> = new Set();

      for (const payment of payments) {
        // The issued_dates for the feeding fee are stored as comma-separated
        // We need to figure out which dates this payment covers
        // For now, we'll mark the payment_date or track from related StudentFeedingFee
        if (payment.payment_date) {
          paidDates.add(payment.payment_date);
        }
      }

      // Also fetch from StudentFeedingFee to see payment history
      const studentFeeData = await api.fees.studentFeedingFees.list({
        student: studentId,
        feeding_fee: feedingFeeId,
        page_size: 10
      });

      const studentFees = studentFeeData.results || studentFeeData;
      if (studentFees.length > 0) {
        const studentFee = studentFees[0];
        console.log(`Student feeding fee found:`, studentFee);

        // If there's amount_paid, the student has paid for some dates
        // We should fetch the payment records to see which specific dates
        if (studentFee.payments && studentFee.payments.length > 0) {
          studentFee.payments.forEach((payment: any) => {
            if (payment.payment_date) {
              paidDates.add(payment.payment_date);
            }
          });
        }
      }

      const paidDatesList = Array.from(paidDates);
      console.log(`Paid dates for student ${studentId}:`, paidDatesList);
      setPaidDatesByStudent({
        ...paidDatesByStudent,
        [studentId]: paidDatesList
      });

      return paidDatesList;
    } catch (error) {
      console.error('Error fetching paid dates:', error);
      return [];
    }
  };

  const fetchStudentFeeDetails = async () => {
    try {
      if (!selectedStudent || !selectedTerm) {
        console.log('Missing selectedStudent or selectedTerm', { selectedStudent, selectedTerm });
        setStudentFeeDetails(null);
        return;
      }

      console.log('Fetching fees for student:', selectedStudent, 'term:', selectedTerm);

      // Fetch fees for the specific student
      const feeData = await api.fees.studentFees.list({ 
        student: selectedStudent, 
        page_size: 1000
      });
      
      // Get the array of fees
      const fees = Array.isArray(feeData.results) ? feeData.results : (Array.isArray(feeData) ? feeData : []);
      
      console.log('All student fees returned:', fees.length, fees);
      
      // Find the fee for the selected term
      const studentId = parseInt(selectedStudent);
      const termId = selectedTerm;
      
      console.log('Looking for studentId:', studentId, 'termId:', termId);
      
      const studentFeeForTerm = fees.find((fee: any) => {
        // Check if student matches
        if (fee.student !== studentId) {
          console.log('Student mismatch:', fee.student, '!=', studentId);
          return false;
        }
        
        // Check if term matches (could be in fee_structure.term or fee.term)
        const feeTermId = fee.fee_structure?.term ?? fee.term;
        console.log('Checking term:', feeTermId, 'vs', termId, 'fee_structure:', fee.fee_structure);
        return feeTermId === termId;
      });
      
      if (studentFeeForTerm) {
        console.log('✓ Found StudentFee:', studentFeeForTerm);
        setStudentFeeDetails(studentFeeForTerm);
      } else {
        console.warn(`✗ No StudentFee found for student ${studentId}, term ${termId}`);
        console.log('Available fees for this student:', fees.map((f: any) => ({
          id: f.id,
          student: f.student,
          term: f.fee_structure?.term,
          amount_due: f.amount_due,
          amount_paid: f.amount_paid
        })));
        setStudentFeeDetails(null);
      }
    } catch (error) {
      console.error('Error fetching student fee details:', error);
      setStudentFeeDetails(null);
    }
  };

  const handleRecordSchoolFee = async () => {
    try {
      if (!selectedStudent || !selectedTerm || !amountPaid) {
        alert('Please fill all required fields');
        return;
      }

      if (!studentFeeDetails?.id) {
        alert('Student fee details not found. Please ensure the student has a fee for this term.');
        return;
      }

      // Generate a receipt number
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await api.fees.payments.create({
        student_fee: studentFeeDetails.id,
        amount: parseFloat(amountPaid),
        payment_date: new Date().toISOString().split('T')[0],
        receipt_number: receiptNumber,
        payment_method: 'cash'
      });

      alert('School fee recorded successfully!');
      setShowRecordFeeModal(false);
      resetForm();
      fetchFees();
    } catch (error) {
      console.error('Error recording school fee:', error);
      alert('Failed to record school fee');
    }
  };

  const handleRecordFeedingFee = async () => {
    try {
      if (!selectedFeedingFeeId || !selectedClass) {
        alert('Please select a feeding fee and class');
        return;
      }

      const selectedDaysList = Object.keys(selectedDates).filter(date => selectedDates[date]);
      
      if (selectedDaysList.length === 0) {
        alert('Please select at least one date');
        return;
      }

      const paidStudents = Object.keys(attendanceRecords).filter(id => attendanceRecords[id]);
      
      if (paidStudents.length === 0) {
        alert('Please select at least one student');
        return;
      }

      const selectedFee = availableFeedingFees.find(f => f.id === parseInt(selectedFeedingFeeId));
      if (!selectedFee) {
        alert('Feeding fee not found');
        return;
      }

      // Calculate amount: daily_rate × number of days selected
      const totalAmount = parseFloat(selectedFee.daily_rate || 0) * selectedDaysList.length;

      // Create payment records for each selected student
      for (const studentId of paidStudents) {
        try {
          // Fetch the StudentFeedingFee record for this student and feeding fee
          const studentFeeData = await api.fees.studentFeedingFees.list({
            student: studentId,
            feeding_fee: selectedFeedingFeeId,
            page_size: 100
          });
          
          const studentFeedingFees = Array.isArray(studentFeeData.results) 
            ? studentFeeData.results 
            : (Array.isArray(studentFeeData) ? studentFeeData : []);
          
          if (studentFeedingFees.length === 0) {
            console.warn(`No StudentFeedingFee found for student ${studentId} and feeding fee ${selectedFeedingFeeId}`);
            continue;
          }

          const studentFeedingFee = studentFeedingFees[0];
          const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Record payment using the correct endpoint with StudentFeedingFee ID
          await api.fees.feedingFeePayments.create({
            student_feeding_fee: studentFeedingFee.id,
            amount: totalAmount,
            payment_date: new Date().toISOString().split('T')[0],
            receipt_number: receiptNumber,
            payment_method: 'cash'
          });
        } catch (studentError) {
          console.error(`Error recording feeding fee for student ${studentId}:`, studentError);
          // Continue with next student even if one fails
        }
      }

      alert(`Feeding fee recorded for ${paidStudents.length} students for ${selectedDaysList.length} day(s)!\nTotal per student: GHS ${totalAmount.toFixed(2)}`);
      setShowRecordFeeModal(false);
      resetForm();
      fetchFees();
    } catch (error) {
      console.error('Error recording feeding fees:', error);
      alert('Failed to record feeding fees');
    }
  };

  const handleCheckOwers = async () => {
    try {
      if (!owersClass) {
        alert('Please select a class');
        return;
      }

      const classIdNum = typeof owersClass === 'string' ? parseInt(owersClass) : owersClass;

      if (owersFeeType === 'school') {
        // First, get all students in the selected class
        const classStudents = await api.classes.students(classIdNum.toString());
        const studentIds = new Set((classStudents.results || classStudents).map((s: any) => s.id));
        
        console.log('Students in class', classIdNum, ':', studentIds);
        
        // Fetch all student fees
        const allFees = await api.fees.studentFees.list({ 
          page_size: 1000
        });
        
        // Filter for students in the selected class who owe money
        const classStudentFees = (allFees.results || allFees).filter((fee: any) => {
          const isInClass = studentIds.has(fee.student);
          const owesMoneyStatus = fee.status === 'pending' || fee.status === 'partial' || fee.status === 'overdue';
          
          return isInClass && owesMoneyStatus;
        });
        
        // Group by student to get unique students and sum their balances
        const studentOweMap = new Map();
        classStudentFees.forEach((fee: any) => {
          if (!studentOweMap.has(fee.student)) {
            studentOweMap.set(fee.student, {
              student: fee.student,
              student_name: fee.student_name,
              class_name: fee.class_name,
              status: fee.status,
              totalBalance: 0,
              fees: []
            });
          }
          const entry = studentOweMap.get(fee.student);
          entry.totalBalance += parseFloat(fee.balance || 0);
          entry.fees.push(fee);
        });
        
        // Convert map to array and sort by student name
        const uniqueOwersList = Array.from(studentOweMap.values())
          .sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));
        
        console.log('Unique owers:', uniqueOwersList);
        setOwnersList(uniqueOwersList);
        
        if (uniqueOwersList.length === 0) {
          alert('No owers found for the selected class');
        }
      } else {
        // For feeding fees, get students with unpaid feeding fees
        const owersData = await api.fees.studentFeedingFees.fee_owers();
        const allOwersList = owersData.results || owersData;
        
        // Filter by class if a class is selected
        if (owersClass) {
          // Get students in the selected class
          const classStudents = await api.classes.students(classIdNum.toString());
          const studentIds = new Set((classStudents.results || classStudents).map((s: any) => s.id));
          
          // Filter owers to only include students from the selected class
          const filteredOwersList = allOwersList.filter((ower: any) => studentIds.has(ower.student));
          setOwnersList(filteredOwersList);
        } else {
          setOwnersList(allOwersList);
        }
      }
    } catch (error) {
      console.error('Error fetching owers:', error);
      alert('Failed to fetch owers list: ' + (error as any).message);
    }
  };

  const resetForm = () => {
    setSelectedTerm(1);
    setSelectedClass('');
    setSelectedStudent('');
    setSelectedDay(new Date().toISOString().split('T')[0]);
    setAmountPaid('');
    setStudentFeeDetails(null);
    setAttendanceRecords({});
    setSelectedFeedingFeeId('');
    setIssuedDates([]);
    setSelectedDates({});
  };

  const filteredFees = fees.filter(fee =>
    fee.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'fee_type',
      header: 'Fee Type',
      render: (fee: any) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            fee.fee_type_badge === 'school'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {fee.fee_type}
        </span>
      )
    },
    { key: 'student_name', header: 'Student Name' },
    { key: 'class_name', header: 'Class' },
    { 
      key: 'amount_paid', 
      header: 'Paid', 
      render: (fee: any) => `GHS ${parseFloat(fee.amount_paid || 0).toFixed(2)}` 
    },
    { 
      key: 'balance', 
      header: 'Balance', 
      render: (fee: any) => `GHS ${parseFloat(fee.balance || 0).toFixed(2)}` 
    },
    { 
      key: 'due_date', 
      header: 'Due Date',
      render: (fee: any) => fee.due_date ? formatDate(fee.due_date) : 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      render: (fee: any) => <StatusBadge status={fee.status || 'pending'} />
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Expected"
          value={`GHS ${parseFloat(feeStats?.total_expected || 0).toLocaleString()}`}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Collected"
          value={`GHS ${parseFloat(feeStats?.total_collected || 0).toLocaleString()}`}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Outstanding"
          value={`GHS ${parseFloat(feeStats?.total_outstanding || 0).toLocaleString()}`}
          icon={<FiTrendingDown className="w-6 h-6" />}
          color="primary"
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Collection Rate"
          value={feeStats?.collection_rate ? `${feeStats.collection_rate.toFixed(1)}%` : '0%'}
          icon={<FiUsers className="w-6 h-6" />}
          color="purple"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Fees Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Student Fees</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search fees..."
              className="input-field w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowOwersModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <FiAlertCircle className="w-4 h-4" />
              Check Owers
            </button>
            <button
              onClick={() => setShowRecordFeeModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Record Fees
            </button>
          </div>
        </div>
        
        <DataTable columns={columns} data={filteredFees} />
      </div>

      {/* Record Fee Modal */}
      {showRecordFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Record Fees</h2>
              <button onClick={() => { setShowRecordFeeModal(false); resetForm(); }}>
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Fee Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => { setFeeType('school'); resetForm(); }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    feeType === 'school'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  School Fees
                </button>
                <button
                  onClick={() => { setFeeType('feeding'); resetForm(); }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    feeType === 'feeding'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Feeding Fees
                </button>
              </div>
            </div>

            {/* School Fees Form */}
            {feeType === 'school' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Class...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    disabled={!selectedClass}
                  >
                    <option value="">Select Student...</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {studentFeeDetails && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Fee Details</h4>
                    <p className="text-sm">Total Amount: GHS {parseFloat(studentFeeDetails.amount_due || 0).toFixed(2)}</p>
                    <p className="text-sm">Amount Paid: GHS {parseFloat(studentFeeDetails.amount_paid || 0).toFixed(2)}</p>
                    <p className="text-sm font-bold text-primary-600">Balance: GHS {parseFloat(studentFeeDetails.balance || 0).toFixed(2)}</p>
                  </div>
                )}

                {!studentFeeDetails && selectedStudent && selectedTerm && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-semibold">⚠️ No fee found for this student & term</p>
                    <p className="text-xs text-yellow-700 mt-2">To fix this:</p>
                    <ol className="text-xs text-yellow-700 list-decimal list-inside mt-1 space-y-1">
                      <li>Go to <strong>Fees Settings</strong></li>
                      <li>Click <strong>Issue School Fees</strong></li>
                      <li>Select this class, term, and amount</li>
                      <li>Click <strong>Issue School Fees</strong> to create fees for all students</li>
                    </ol>
                    <p className="text-xs text-yellow-600 mt-2 italic">Check browser console (F12) for debugging info</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter amount paid"
                  />
                </div>

                <button
                  onClick={handleRecordSchoolFee}
                  disabled={!studentFeeDetails}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    studentFeeDetails
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {studentFeeDetails ? 'Record School Fee' : 'Select Student & Term First'}
                </button>
              </div>
            )}

            {/* Feeding Fees Form */}
            {feeType === 'feeding' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Feeding Fee</label>
                  <select
                    value={selectedFeedingFeeId}
                    onChange={(e) => {
                      handleFeedingFeeSelect(e.target.value);
                    }}
                    onFocus={fetchAvailableFeedingFees}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a feeding fee...</option>
                    {availableFeedingFees.map(fee => (
                      <option key={fee.id} value={fee.id}>
                        Term {fee.term} - GHS {parseFloat(fee.daily_rate || 0).toFixed(2)}/day
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Class...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                {selectedClass && students.length > 0 && (
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h4 className="font-semibold mb-3">Students (Select to see paid dates)</h4>
                    <div className="space-y-2">
                      {students.map(student => (
                        <button
                          key={student.id}
                          onClick={async () => {
                            setSelectedStudent(student.id.toString());
                            setAttendanceRecords({ [student.id]: true });
                            // Fetch paid dates for this student
                            if (selectedFeedingFeeId) {
                              const paidDates = await fetchPaidDatesForStudent(
                                student.id.toString(),
                                selectedFeedingFeeId
                              );
                              // Pre-populate the paid dates in selectedDates
                              const newSelectedDates: {[key: string]: boolean} = {};
                              paidDates.forEach(date => {
                                newSelectedDates[date] = true;
                              });
                              setSelectedDates(newSelectedDates);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            attendanceRecords[student.id]
                              ? 'bg-primary-100 border border-primary-500 text-primary-900'
                              : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {student.first_name} {student.last_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {issuedDates.length > 0 && selectedStudent && (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">
                      Available Dates (Check the days paid)
                      {selectedStudent && paidDatesByStudent[selectedStudent] && paidDatesByStudent[selectedStudent].length > 0 && (
                        <span className="text-sm text-blue-600 ml-2">
                          ({paidDatesByStudent[selectedStudent].length} already paid)
                        </span>
                      )}
                    </h4>
                    <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                      {issuedDates.map(date => {
                        const isPaid = !!(selectedStudent && paidDatesByStudent[selectedStudent]?.includes(date));
                        return (
                          <label
                            key={date}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                              isPaid
                                ? 'bg-green-50 hover:bg-green-100 border border-green-300'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedDates[date] || false}
                              onChange={(e) => setSelectedDates({
                                ...selectedDates,
                                [date]: e.target.checked
                              })}
                              className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                              disabled={isPaid}
                            />
                            <span className="text-sm">{formatDate(date)}</span>
                            {isPaid && <span className="text-xs text-green-600 ml-auto">✓ Paid</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRecordFeedingFee}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  disabled={!selectedClass || !selectedFeedingFeeId || issuedDates.length === 0 || Object.values(attendanceRecords).every(v => !v)}
                >
                  Record Feeding Fees
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check Owers Modal */}
      {showOwersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Check Fee Owers</h2>
              <button onClick={() => { setShowOwersModal(false); setOwnersList([]); }}>
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setOwersFeeType('school')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      owersFeeType === 'school'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    School Fees
                  </button>
                  <button
                    onClick={() => setOwersFeeType('feeding')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      owersFeeType === 'feeding'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Feeding Fees
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={owersClass}
                  onChange={(e) => setOwersClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Class...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCheckOwers}
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Check Owers
              </button>
            </div>

            {owersList.length > 0 && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Class</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Amount Owed</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {owersList.map((ower, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm">{ower.student_name}</td>
                        <td className="px-4 py-3 text-sm">{ower.class_name}</td>
                        <td className="px-4 py-3 text-sm text-primary-600 font-semibold">
                          GHS {parseFloat(ower.totalBalance || ower.balance || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={ower.status || 'pending'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {owersList.length === 0 && owersClass && (
              <div className="text-center py-8 text-gray-500">
                No owers found for the selected class
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

