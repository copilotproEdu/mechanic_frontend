'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiX } from 'react-icons/fi';
import api from '@/lib/api';
import { formatDate, formatDateForInput, convertToISODate } from '@/lib/dateUtils';

// Fee types
type FeeType = 'school_fees' | 'feeding_fees';

interface Class {
  id: string;
  name: string;
  grade_level: string;
  room_number: string;
  capacity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SchoolFeeRecord {
  id: string;
  classId: string;
  className: string;
  academicYear: string;
  term1: number;
  term2: number;
  term3: number;
  total: number;
}

interface FeedingFeeRecord {
  id: string;
  daily_rate: number;
  academic_year: string;
  term: number | null;
  created_at: string;
  updated_at: string;
  weekly_estimate: number;
}

export default function FeesSettingsPage() {
  const [activeTab, setActiveTab] = useState<FeeType>('school_fees');
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolFees, setSchoolFees] = useState<SchoolFeeRecord[]>([]);
  const [feedingFees, setFeedingFees] = useState<FeedingFeeRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [feeAmount, setFeeAmount] = useState<string>('');
  const [feedingFeeStartDate, setFeedingFeeStartDate] = useState<string>('');
  const [feedingFeeEndDate, setFeedingFeeEndDate] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Load classes and fees from the database
  const fetchSchoolFees = async () => {
    try {
      // Fetch fee structures instead of student fees - these show the amounts issued for each term
      const feeStructuresData = await api.fees.structures.list({ page_size: 1000 });
      const feeStructures = feeStructuresData.results || feeStructuresData;
      
      console.log('All fee structures loaded:', feeStructures);
      console.log('Number of fee structures:', feeStructures.length);
      
      // Group by class ID AND academic year to show all terms for each class per year
      const feesByKey: {[key: string]: any} = {};
      
      feeStructures.forEach((structure: any) => {
        const classId = structure.class_grade;
        const className = structure.class_name || `Class ${classId}`;
        const academicYear = structure.academic_year || 'Unknown';
        const key = `${classId}-${academicYear}`;
        
        console.log(`Processing structure: Class=${classId}, Year=${academicYear}, Term=${structure.term}, Amount=${structure.total_fee}`);
        
        if (!feesByKey[key]) {
          feesByKey[key] = {
            id: key,
            classId: classId,
            className: className,
            academicYear: academicYear,
            term1: 0,
            term2: 0,
            term3: 0,
          };
        }
        
        // Add the amount to the correct term
        const term = structure.term || 0;
        const amount = structure.total_fee || 0;
        
        if (term === 1) feesByKey[key].term1 = amount;
        else if (term === 2) feesByKey[key].term2 = amount;
        else if (term === 3) feesByKey[key].term3 = amount;
      });
      
      const transformed = Object.values(feesByKey);
      console.log('Transformed school fees with academic years:', transformed);
      setSchoolFees(transformed);
    } catch (error) {
      console.error('Error fetching school fees:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes, school fees, feeding fees, and academic terms
        const [classesData, feedingFeesData, academicTermsData] = await Promise.all([
          api.classes.list({ page_size: 100 }), // Get all classes
          api.fees.feedingFees.list({ page_size: 100 }), // Get all feeding fees
          api.results.academicTerms.list({ page_size: 100 }) // Get all academic terms
        ]);

        setClasses(classesData.results || classesData);

        // Fetch school fees from backend
        await fetchSchoolFees();

        // Format feeding fees data to match our interface
        const formattedFeedingFees = (feedingFeesData.results || feedingFeesData).map((fee: any) => ({
          ...fee,
          class_name: 'All Students' // General feeding fee applies to all students
        }));
        setFeedingFees(formattedFeedingFees);

        // Extract unique academic years from Academic Terms ONLY
        const academicYearsSet = new Set<string>();
        
        console.log('Loading academic years from Academic Terms...');
        
        // Add from academic terms ONLY
        (academicTermsData.results || academicTermsData).forEach((term: any) => {
          if (term.academic_year) {
            console.log('Found academic year in term:', term.academic_year);
            academicYearsSet.add(term.academic_year);
          }
        });
        
        console.log('All unique academic years from terms:', Array.from(academicYearsSet));
        
        // Convert to sorted array (most recent first)
        const sortedYears = Array.from(academicYearsSet).sort((a, b) => {
          const yearA = parseInt(a.split('/')[0]);
          const yearB = parseInt(b.split('/')[0]);
          return yearB - yearA;
        });
        
        console.log('Sorted academic years:', sortedYears);
        
        setAvailableAcademicYears(sortedYears);
        if (sortedYears.length > 0) {
          setSelectedAcademicYear(sortedYears[0]);
          console.log('Selected academic year set to:', sortedYears[0]);
        } else {
          console.warn('No academic terms found! Please create academic terms first.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-populate feeding fee start/end dates from academic term dates
  useEffect(() => {
    const autoPopulateFeedingFeeDates = async () => {
      // Only auto-populate when in feeding fees tab and both term and year are selected
      if (activeTab !== 'feeding_fees' || !selectedTerm || !selectedAcademicYear) {
        return;
      }

      try {
        // Fetch the academic term matching the selected year and term
        const academicTermsData = await api.results.academicTerms.list({
          academic_year: selectedAcademicYear,
          page_size: 100
        });

        const academicTerms = academicTermsData.results || academicTermsData;
        const matchingTerm = academicTerms.find(
          (term: any) => term.term === selectedTerm.toString() || term.term === selectedTerm
        );

        if (matchingTerm && matchingTerm.start_date && matchingTerm.end_date) {
          // Extract dates and convert to the correct format
          const startDate = convertToISODate(matchingTerm.start_date);
          const endDate = convertToISODate(matchingTerm.end_date);

          console.log(`Auto-populating feeding fee dates from term: ${startDate} to ${endDate}`);
          
          setFeedingFeeStartDate(startDate);
          setFeedingFeeEndDate(endDate);
        }
      } catch (error) {
        console.error('Error auto-populating feeding fee dates:', error);
        // Silently fail - don't alert the user for auto-population attempts
      }
    };

    autoPopulateFeedingFeeDates();
  }, [selectedTerm, selectedAcademicYear, activeTab]);

  // Handle School Fees Edit
  const handleEditSchoolFee = (fee: SchoolFeeRecord) => {
    setEditingId(fee.id);
    setFormData(fee);
  };

  // Handle Feeding Fees Edit
  const handleEditFeedingFee = (fee: FeedingFeeRecord) => {
    setEditingId(fee.id);
    setFormData(fee);
  };

  // Handle Save School Fee
  const handleSaveSchoolFee = async () => {
    try {
      const classId = formData.classId;
      const academicYearToUpdate = formData.academicYear || selectedAcademicYear;
      
      // Update fee structures for each term
      const updates = [
        { term: 1, amount: formData.term1 || 0 },
        { term: 2, amount: formData.term2 || 0 },
        { term: 3, amount: formData.term3 || 0 }
      ];

      for (const update of updates) {
        if (update.amount > 0) {
          // Find or create fee structure for this class and term
          const structures = await api.fees.structures.list({ 
            class_id: classId,
            page_size: 100 
          });
          
          const existingStructure = (structures.results || structures).find(
            (s: any) => s.class_grade === classId && s.term === update.term && s.academic_year === academicYearToUpdate
          );

          const dueDate = new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0];

          if (existingStructure) {
            // Update existing structure
            await api.fees.structures.update(existingStructure.id, {
              tuition_fee: update.amount,
            });
          } else {
            // Create new structure - use selected academic year
            await api.fees.structures.create({
              class_grade: classId,
              academic_year: academicYearToUpdate,
              term: update.term,
              tuition_fee: update.amount,
              library_fee: 0,
              lab_fee: 0,
              sports_fee: 0,
              transport_fee: 0,
              miscellaneous_fee: 0,
              due_date: dueDate
            });
          }

          // Update all student fees for this class and term
          const studentFees = await api.fees.studentFees.list({
            'fee_structure__term': update.term,
            'fee_structure__academic_year': academicYearToUpdate,
            page_size: 1000
          });
          
          const feesToUpdate = (studentFees.results || studentFees).filter(
            (fee: any) =>
              fee.fee_structure?.class_grade === classId
          );

          // Update each student fee amount
          for (const fee of feesToUpdate) {
            await api.fees.studentFees.update(fee.id, {
              amount_due: update.amount
            });
          }
        }
      }

      // Refetch school fees
      await fetchSchoolFees();
      setEditingId(null);
      setFormData({});
      
      alert('School fees updated successfully!');
    } catch (error) {
      console.error('Error updating school fee:', error);
      alert('Failed to update school fees');
    }
  };

  // Handle Save Feeding Fee
  const handleSaveFeedingFee = async () => {
    try {
      // Update the feeding fee in the database
      const updatedFee = await api.fees.feedingFees.update(editingId!, {
        ...formData,
        daily_rate: formData.daily_rate,
        academic_year: formData.academic_year,
        term: formData.term,
      });

      // Update the local state
      const updatedFees = feedingFees.map(fee =>
        fee.id === editingId ? updatedFee : fee
      );
      setFeedingFees(updatedFees);
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating feeding fee:', error);
    }
  };

  // Handle Delete School Fee
  const handleDeleteSchoolFee = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this fee and all associated student fees? This action cannot be undone.')) {
        return;
      }

      const feeToDelete = schoolFees.find(f => f.id === id);
      if (!feeToDelete) {
        alert('Fee not found');
        return;
      }

      // Get all fee structures for this class and academic year
      const structures = await api.fees.structures.list({
        class_id: feeToDelete.classId,
        page_size: 100
      });

      const structuresForClass = (structures.results || structures).filter(
        (s: any) => s.class_grade === feeToDelete.classId && s.academic_year === feeToDelete.academicYear
      );

      // Delete all fee structures and their associated student fees
      for (const structure of structuresForClass) {
        // Delete student fees for this structure
        const studentFees = await api.fees.studentFees.list({
          'fee_structure__id': structure.id,
          page_size: 1000
        });

        for (const fee of studentFees.results || studentFees) {
          await api.fees.studentFees.delete(fee.id.toString());
        }

        // Delete the fee structure
        await api.fees.structures.delete(structure.id.toString());
      }

      // Update local state
      setSchoolFees(schoolFees.filter(fee => fee.id !== id));
      alert('School fees and all associated student fees deleted successfully!');
    } catch (error) {
      console.error('Error deleting school fees:', error);
      alert('Failed to delete school fees. Please try again.');
    }
  };

  // Handle Delete Feeding Fee
  const handleDeleteFeedingFee = async (id: string | number) => {
    try {
      if (!window.confirm('Are you sure you want to delete this feeding fee and all associated student fees? This action cannot be undone.')) {
        return;
      }

      const feeToDelete = feedingFees.find(f => f.id === id || f.id.toString() === id.toString());
      if (!feeToDelete) {
        alert('Feeding fee not found in list');
        return;
      }

      // Delete all student feeding fees for this feeding fee
      const studentFeedingFees = await api.fees.studentFeedingFees.list({
        feeding_fee: id.toString(),
        page_size: 1000
      });

      for (const fee of studentFeedingFees.results || studentFeedingFees) {
        await api.fees.studentFeedingFees.delete(fee.id.toString());
      }

      // Delete the feeding fee from the database
      await api.fees.feedingFees.delete(id.toString());

      // Update the local state
      setFeedingFees(feedingFees.filter(fee => fee.id !== id && fee.id.toString() !== id.toString()));
      alert('Feeding fee and all associated student fees deleted successfully!');
    } catch (error) {
      console.error('Error deleting feeding fee:', error);
      alert('Failed to delete feeding fee. Please try again.');
    }
  };

  // Handle Add School Fee
  const handleAddSchoolFee = async () => {
    if (!selectedTerm || !feeAmount || !selectedClass) {
      alert('Please select a term, class, and enter fee amount');
      return;
    }

    try {
      const academicYear = selectedAcademicYear;
      const dueDate = new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0];

      // Determine which classes to process
      let classesToProcess: any[] = [];
      
      if (selectedClass === 'all') {
        // Process all classes
        classesToProcess = classes;
      } else {
        // Process single class
        const classId = typeof selectedClass === 'string' ? selectedClass : String(selectedClass);
        const selectedClassData = classes.find(c => String(c.id) === classId);
        
        if (!selectedClassData) {
          console.error('Classes available:', classes);
          console.error('Selected class ID:', classId);
          alert('Invalid class selected. Please refresh and try again.');
          return;
        }
        
        classesToProcess = [selectedClassData];
      }

      let totalCreatedCount = 0;
      let totalUpdatedCount = 0;
      let processedClassesCount = 0;

      // Process each class
      for (const selectedClassData of classesToProcess) {
        const classId = selectedClassData.id;

        // First, get or create a fee structure for this class and term
        const feeStructures = await api.fees.structures.list({
          class_id: classId,
          page_size: 100
        });
        
        // Find existing structure for this specific term and academic year
        let feeStructure = null;
        let priceChanged = false;
        const feeAmountValue = parseFloat(feeAmount);
        const existingStructure = (feeStructures.results || feeStructures).find(
          (s: any) => s.class_grade === classId && s.term === selectedTerm && s.academic_year === academicYear
        );
        
        if (existingStructure) {
          const existingAmountRaw = existingStructure.total_fee ?? existingStructure.tuition_fee ?? 0;
          const existingAmount = parseFloat(existingAmountRaw);
          priceChanged = existingAmount !== feeAmountValue;

          if (priceChanged) {
            // Update existing structure only if price changed
            feeStructure = await api.fees.structures.update(existingStructure.id, {
              tuition_fee: feeAmountValue,
            });
          } else {
            feeStructure = existingStructure;
          }
        } else {
          // Create a new fee structure if it doesn't exist
          feeStructure = await api.fees.structures.create({
            class_grade: classId,
            academic_year: academicYear,
            term: selectedTerm,
            tuition_fee: feeAmountValue,
            library_fee: 0,
            lab_fee: 0,
            sports_fee: 0,
            transport_fee: 0,
            miscellaneous_fee: 0,
            due_date: dueDate
          });
        }

        // Get students for the selected class using the dedicated endpoint
        const studentsData = await api.classes.students(classId.toString());
        let students = Array.isArray(studentsData) ? studentsData : (studentsData.results || []);
        
        // Ensure students is always an array
        if (!Array.isArray(students)) {
          students = [];
        }
        
        // Log for debugging
        console.log('Students fetched for class', classId, ':', students.length, 'students', students);

        if (students.length === 0) {
          console.warn(`⚠️ No active students found in class ${selectedClassData.name}`);
          continue; // Skip this class but continue with others
        }

        // Get existing student fees for this fee structure
        const existingStudentFees = await api.fees.studentFees.list({
          'fee_structure__term': selectedTerm,
          'fee_structure__academic_year': academicYear,
          page_size: 1000
        });
        
        const existingFeesList = (existingStudentFees.results || existingStudentFees);
        const existingFeesByStudent = new Map();
        existingFeesList.forEach((fee: any) => {
          // Only map fees for THIS class
          if (fee.fee_structure?.class_grade === classId) {
            existingFeesByStudent.set(fee.student, fee);
          }
        });

        const hasMismatchedAmount = existingFeesList.some((fee: any) => {
          const matchesStructure = fee.fee_structure?.id === feeStructure.id || fee.fee_structure === feeStructure.id;
          if (!matchesStructure) return false;
          const existingAmount = parseFloat(fee.amount_due ?? 0);
          return existingAmount !== feeAmountValue;
        });

        const updateExistingFees = priceChanged || hasMismatchedAmount;

        // Create or update fee records for all active students in the class
        let classCreatedCount = 0;
        let classUpdatedCount = 0;
        
        for (const student of students) {
          const existingFee = existingFeesByStudent.get(student.id);
          
          if (existingFee) {
            if (!updateExistingFees) {
              // Fee already issued and price unchanged; skip existing students
              continue;
            }

            // Price changed: update existing fee for all students
            await api.fees.studentFees.update(existingFee.id, {
              amount_due: feeAmountValue,
              due_date: dueDate
            });
            classUpdatedCount++;
            totalUpdatedCount++;
          } else {
            // Create new fee for students who haven't been issued yet
            const studentId = typeof student.id === 'string' ? parseInt(student.id) : student.id;
            const structureId = typeof feeStructure.id === 'string' ? parseInt(feeStructure.id) : feeStructure.id;
            
            try {
              // Try to create, if it already exists with same structure, update it instead
              const payload = {
                student: studentId,
                fee_structure_id: structureId,
                amount_due: feeAmountValue,
                amount_paid: 0,
                due_date: dueDate
              };
              
              const createdFee = await api.fees.studentFees.create(payload);
              console.log(`✓ Created StudentFee for student ${studentId}:`, createdFee);
              classCreatedCount++;
              totalCreatedCount++;
            } catch (error: any) {
              // If it's a duplicate (409 or 400 with unique constraint), log but continue
              if (error?.status === 400 || error?.status === 409) {
                console.log(`ℹ StudentFee already exists for student ${studentId}, skipping`);
              } else {
                console.error(`✗ Failed to create StudentFee for student ${studentId}:`, error);
                throw error;
              }
            }
          }
        }

        processedClassesCount++;
        console.log(`Class ${selectedClassData.name}: Created ${classCreatedCount}, Updated ${classUpdatedCount}`);
      }

      // Build completion message
      let message = '';
      if (selectedClass === 'all') {
        message = `School fees for Term ${selectedTerm} issued to ${processedClassesCount} classes!\n`;
        message += `Total: ${totalCreatedCount} created, ${totalUpdatedCount} updated`;
      } else {
        const className = classesToProcess[0]?.name || 'Class';
        message = totalCreatedCount > 0 && totalUpdatedCount > 0 
          ? `School fees for Term ${selectedTerm} in ${className}: ${totalCreatedCount} created, ${totalUpdatedCount} updated!`
          : totalCreatedCount > 0
          ? `School fees for Term ${selectedTerm} issued to ${totalCreatedCount} students in ${className}!`
          : `School fees for Term ${selectedTerm} updated for ${totalUpdatedCount} students in ${className}!`;
      }
      
      alert(message);
      
      // Wait a moment for the database to update, then refetch and verify
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify that student fees were created
      if (totalCreatedCount > 0) {
        const verifyFees = await api.fees.studentFees.list({ page_size: 100 });
        const verifyList = verifyFees.results || verifyFees;
        const newFeesCount = verifyList.filter((f: any) => f.created_at && new Date(f.created_at) > new Date(Date.now() - 60000)).length;
        console.log(`✓ Verification: ${newFeesCount} StudentFee records found created in last 60 seconds`);
        console.log('Sample StudentFees:', verifyList.slice(0, 3));
      }
      
      await fetchSchoolFees();
      
      setShowAddModal(false);
      setSelectedTerm(1);
      setFeeAmount('');
      setSelectedClass('');
      // Reset to first available academic year
      if (availableAcademicYears.length > 0) {
        setSelectedAcademicYear(availableAcademicYears[0]);
      }
    } catch (error) {
      console.error('Error adding school fees:', error);
      alert('Failed to add school fees. Please try again.');
    }
  };

  // Handle Add Feeding Fee
  const handleAddFeedingFee = async () => {
    try {
      if (!feeAmount || !feedingFeeStartDate || !feedingFeeEndDate) {
        alert('Please fill in all feeding fee fields');
        return;
      }

      const academicYear = selectedAcademicYear;
      const termValue = selectedTerm;
      
      // Check if feeding fee already exists for this academic year and term (check both local state and backend)
      const existingLocalFees = feedingFees.filter(
        (fee: any) => fee.academic_year === academicYear && fee.term === termValue
      );
      
      if (existingLocalFees.length > 0) {
        alert(`A feeding fee already exists for ${academicYear}, Term ${termValue}. Please delete it first or select a different term.`);
        return;
      }
      
      // Also check backend to ensure no duplicate was created
      try {
        const backendFees = await api.fees.feedingFees.list({ page_size: 1000 });
        const existingBackendFee = (backendFees.results || backendFees).find(
          (fee: any) => fee.academic_year === academicYear && fee.term === termValue
        );
        
        if (existingBackendFee) {
          alert(`A feeding fee already exists for ${academicYear}, Term ${termValue}. Refreshing data...`);
          // Refresh the feeding fees list
          const feedingFeesData = await api.fees.feedingFees.list({ page_size: 1000 });
          const formattedFeedingFees = (feedingFeesData.results || feedingFeesData).map((fee: any) => ({
            ...fee,
            class_name: 'All Students'
          }));
          setFeedingFees(formattedFeedingFees);
          return;
        }
      } catch (err) {
        console.warn('Could not verify backend feeding fees:', err);
      }

      // Generate dates between start and end date, excluding weekends
      const dates: string[] = [];
      const start = new Date(feedingFeeStartDate);
      const end = new Date(feedingFeeEndDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          dates.push(d.toISOString().split('T')[0]);
        }
      }

      if (dates.length === 0) {
        alert('No valid weekdays found in the selected date range. Please select a range that includes weekdays.');
        return;
      }

      console.log(`Generated ${dates.length} weekdays from ${feedingFeeStartDate} to ${feedingFeeEndDate}`);

      const issuedDatesStr = dates.join(',');
      const dailyRate = parseFloat(feeAmount);
      const totalAmount = Math.round(dailyRate * dates.length * 100) / 100; // Round to 2 decimal places

      // Create the feeding fee - backend signal will automatically create StudentFeedingFee records for all active students
      const newFee = await api.fees.feedingFees.create({
        daily_rate: dailyRate,
        academic_year: academicYear,
        term: termValue,
        issued_dates: issuedDatesStr,
      });

      // Update the local state
      setFeedingFees([...feedingFees, { ...newFee, class_name: 'All Students' }]);
      setShowAddModal(false);
      setSelectedClass('');
      setFeeAmount('');
      setFeedingFeeStartDate('');
      setFeedingFeeEndDate('');
      // Reset to first available academic year
      if (availableAcademicYears.length > 0) {
        setSelectedAcademicYear(availableAcademicYears[0]);
      }

      alert(`Feeding fees issued for ${dates.length} days (GHS ${dailyRate} per day)\nTotal per student: GHS ${totalAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Error adding feeding fee:', error);
      alert('Failed to add feeding fee. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Loading fees settings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('school_fees')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'school_fees'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          School Fees (Termly)
        </button>
        <button
          onClick={() => setActiveTab('feeding_fees')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'feeding_fees'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Feeding Fees (Daily)
        </button>
      </div>

      {/* School Fees Tab */}
      {activeTab === 'school_fees' && (
        <div>
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Academic Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Term 1</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Term 2</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Term 3</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schoolFees.map((fee) => (
                  <tr key={fee.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{fee.className}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.academicYear}</td>
                    {editingId === fee.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={formData.term1 || 0}
                            onChange={(e) => setFormData({ ...formData, term1: parseFloat(e.target.value) })}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={formData.term2 || 0}
                            onChange={(e) => setFormData({ ...formData, term2: parseFloat(e.target.value) })}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={formData.term3 || 0}
                            onChange={(e) => setFormData({ ...formData, term3: parseFloat(e.target.value) })}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          GHS {((formData.term1 || 0) + (formData.term2 || 0) + (formData.term3 || 0)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={handleSaveSchoolFee}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <FiSave className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setFormData({});
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-600">GHS {(fee.term1 || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">GHS {(fee.term2 || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">GHS {(fee.term3 || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">GHS {((fee.term1 || 0) + (fee.term2 || 0) + (fee.term3 || 0)).toFixed(2)}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEditSchoolFee(fee)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchoolFee(fee.id)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Issue School Fees
            </button>
          </div>
        </div>
      )}

      {/* Feeding Fees Tab */}
      {activeTab === 'feeding_fees' && (
        <div>
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">For</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Academic Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Term</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Daily Rate (GHS)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Weekly Estimate (5 days)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedingFees.map((fee) => (
                  <tr key={`${fee.id}-${fee.academic_year}-${fee.term}`} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">All Classes</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{fee.academic_year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{fee.term ? `Term ${fee.term}` : 'All Terms'}</td>
                    {editingId === fee.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={formData.daily_rate || 0}
                            onChange={(e) => {
                              const dailyRate = parseFloat(e.target.value);
                              setFormData({ ...formData, daily_rate: dailyRate, weekly_estimate: dailyRate * 5 });
                            }}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          GHS {(formData.weekly_estimate || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={handleSaveFeedingFee}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <FiSave className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setFormData({});
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-600">GHS {(Number(fee.daily_rate) || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">GHS {(Number(fee.weekly_estimate) || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEditFeedingFee(fee)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeedingFee(fee.id)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Issue Feeding Fee
            </button>
          </div>
        </div>
      )}

      {/* Add Fee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add {activeTab === 'school_fees' ? 'School Fee' : 'Feeding Fee'}</h2>

            {activeTab === 'school_fees' && (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {availableAcademicYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choose a class...</option>
                    <option value="all">✓ All Classes</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Term</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fee Amount (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="Enter fee amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  This will issue fees to all registered active students for the selected term.
                </p>
              </div>
            )}

            {activeTab === 'feeding_fees' && (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {availableAcademicYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Term</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="Enter daily feeding fee amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(feedingFeeStartDate)}
                    onChange={(e) => setFeedingFeeStartDate(convertToISODate(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(feedingFeeEndDate)}
                    onChange={(e) => setFeedingFeeEndDate(convertToISODate(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Weekends are automatically excluded. Feeding fees will be added to any existing school fees.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedClass('');
                  setSelectedTerm(1);
                  setFeeAmount('');
                  setFeedingFeeStartDate('');
                  setFeedingFeeEndDate('');
                  setFormData({});
                  // Reset to first available academic year
                  if (availableAcademicYears.length > 0) {
                    setSelectedAcademicYear(availableAcademicYears[0]);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'school_fees') {
                    handleAddSchoolFee();
                  } else {
                    handleAddFeedingFee();
                  }
                }}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {activeTab === 'school_fees' ? 'Issue School Fees' : 'Issue Feeding Fee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
