'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';

type Priority = 'high' | 'medium' | 'low';
type FeeType = 'school' | 'feeding';

interface OwingStudent {
  id: string;
  name: string;
  className: string;
  amount: number;
  dueDate: string;
  priority: Priority;
  feeType: FeeType;
}

const StudentsWithFeesCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<OwingStudent[]>([]);
  const [filterType, setFilterType] = useState<FeeType>('school');

  useEffect(() => {
    const fetchStudentsWithOutstandingFees = async () => {
      try {
        setLoading(true);
        const [schoolOwers, feedingOwers] = await Promise.all([
          api.fees.studentFees.fee_owers(),
          api.fees.studentFeedingFees.fee_owers(),
        ]);

        const schoolList = (schoolOwers?.results || schoolOwers || []) as any[];
        const feedingList = (feedingOwers?.results || feedingOwers || []) as any[];

        const mapPriority = (status?: string, balance?: number, amountDue?: number): Priority => {
          if (status === 'overdue') return 'high';
          const ratio = amountDue ? (balance || 0) / amountDue : 0;
          if (ratio >= 0.66) return 'high';
          if (ratio >= 0.33) return 'medium';
          return 'low';
        };

        const normalized: OwingStudent[] = [
          ...schoolList.map((item) => {
            const derivedBalance = Number(item.amount_due ?? 0) - Number(item.amount_paid ?? 0) - Number(item.discount ?? 0);
            const balance = Number(item.balance ?? derivedBalance);
            return {
              id: `school-${item.id}`,
              name: item.student_name || 'Unknown',
              className: item.class_name || 'Class not set',
              amount: balance,
              dueDate: item.due_date || '',
              priority: mapPriority(item.status, balance, Number(item.amount_due)),
              feeType: 'school' as FeeType,
            };
          }),
          ...feedingList.map((item) => {
            const derivedBalance = Number(item.amount_due ?? 0) - Number(item.amount_paid ?? 0) - Number(item.discount ?? 0);
            const balance = Number(item.balance ?? derivedBalance);
            return {
              id: `feeding-${item.id}`,
              name: item.student_name || 'Unknown',
              className: item.class_name || item.feeding_fee_info || 'Class not set',
              amount: balance,
              dueDate: item.due_date || '',
              priority: mapPriority(item.status, balance, Number(item.amount_due)),
              feeType: 'feeding' as FeeType,
            };
          }),
        ];

        // Keep highest owing first
        const sorted = normalized.sort((a, b) => b.amount - a.amount);
        setStudents(sorted);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Failed to fetch students with fees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsWithOutstandingFees();
  }, []);

  const filtered = useMemo(() => students.filter((s) => s.feeType === filterType), [students, filterType]);

  const visibleStudents = useMemo(
    () => filtered.slice(currentIndex, currentIndex + 3),
    [filtered, currentIndex]
  );

  const handleNext = () => {
    // Switch to the other fee type
    setFilterType((current) => (current === 'school' ? 'feeding' : 'school'));
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    // Switch to the other fee type
    setFilterType((current) => (current === 'school' ? 'feeding' : 'school'));
    setCurrentIndex(0);
  };

  const getPriorityClasses = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border border-red-100 text-red-600';
      case 'medium':
        return 'bg-pink-50 border border-pink-100 text-pink-600';
      case 'low':
        return 'bg-yellow-50 border border-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-50 border border-gray-100 text-gray-600';
    }
  };

  return (
    <div className="dashboard-section">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Students with Outstanding Fees ({filterType === 'school' ? 'School Fees' : 'Feeding Fees'})
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrev}
            className="h-8 w-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="h-8 w-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {loading && <p className="text-gray-500">Loading outstanding fees...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500">No outstanding fees found.</p>
        )}
        {!loading && visibleStudents.map((student, index) => {
          const priorityClasses = getPriorityClasses(student.priority);
          const backgroundClasses = priorityClasses.split(' ').filter((c) => c.startsWith('bg-') || c.startsWith('border-')).join(' ');
          const textClass = priorityClasses.split(' ').find((c) => c.startsWith('text-'));

          return (
            <div
              key={`${student.id}-${currentIndex + index}`}
              className={`flex justify-between items-center p-3 rounded-lg border ${backgroundClasses}`}
            >
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-gray-600">{student.className}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${textClass}`}>
                  GHS {student.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">Due: {student.dueDate ? formatDate(student.dueDate) : 'N/A'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentsWithFeesCard;