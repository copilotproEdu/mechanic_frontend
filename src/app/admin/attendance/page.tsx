'use client';

import { useEffect, useMemo, useState } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { FiCheckCircle, FiXCircle, FiBook, FiUser, FiPlus, FiX, FiBarChart2 } from 'react-icons/fi';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceSummary {
  id: string;
  date: string;
  class_name: string;
  class_obj: number;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface Student {
  id: number;
  full_name: string;
  student_id?: string;
}

const statusOrder: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

const statusStyles: Record<AttendanceStatus, string> = {
  present: 'bg-green-50 text-green-700 border border-green-200',
  absent: 'bg-primary-50 text-primary-700 border border-primary-200',
  late: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  excused: 'bg-blue-50 text-blue-700 border border-blue-200',
};

const statusLabels: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
};

const getWeekdaysBetween = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return [] as string[];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: string[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    const iso = d.toISOString().split('T')[0];
    days.push(iso);
  }

  return days;
};

const buildAttendanceSummaries = (records: any[]): AttendanceSummary[] => {
  const grouped: Record<string, AttendanceSummary> = {};

  records.forEach((record) => {
    const key = `${record.class_obj}-${record.date}`;
    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        date: record.date,
        class_name: record.class_name || 'N/A',
        class_obj: record.class_obj,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      };
    }

    const status = (record.status || 'present') as AttendanceStatus;
    grouped[key].total += 1;

    if (status === 'present') grouped[key].present += 1;
    if (status === 'absent') grouped[key].absent += 1;
    if (status === 'late') grouped[key].late += 1;
    if (status === 'excused') grouped[key].excused += 1;
  });

  return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [activeTerm, setActiveTerm] = useState<any | null>(null);
  const [termWeekdays, setTermWeekdays] = useState<string[]>([]);
  const [attendanceDraft, setAttendanceDraft] = useState<Record<number, Record<string, AttendanceStatus>>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [gridScrollPosition, setGridScrollPosition] = useState(0);
  const gridContainerRef = useState<HTMLDivElement | null>(null)[1] as any;
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryClassId, setSummaryClassId] = useState('');
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [teacherClassIds, setTeacherClassIds] = useState<number[]>([]);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [restrictedDueToRole, setRestrictedDueToRole] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchActiveTerm();
    checkUserRole();
  }, []);

  useEffect(() => {
    if (showMarkModal) {
      if (!classes.length) loadClasses();
      if (!activeTerm) fetchActiveTerm();
      if (selectedClassId) {
        handleClassChange(selectedClassId);
      }
    }
  }, [showMarkModal]);

  useEffect(() => {
    if (showSummaryModal && !classes.length) {
      loadClasses();
    }
  }, [showSummaryModal]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [attendanceData, statsData] = await Promise.all([
        api.attendance.list({ page_size: 500 }),
        api.attendance.todayStats()
      ]);

      // Handle both paginated and non-paginated responses
      let records: any[] = [];
      if (attendanceData?.results && Array.isArray(attendanceData.results)) {
        records = attendanceData.results;
      } else if (Array.isArray(attendanceData)) {
        records = attendanceData;
      } else {
        records = [];
      }
      
      console.log('Fetched attendance records:', records);
      setAttendanceRecords(records);
      setAttendanceSummaries(buildAttendanceSummaries(records));
      setTodayStats(statsData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTerm = async () => {
    try {
      const terms = await api.results.academicTerms.activeTerms();
      const active = Array.isArray(terms?.results) ? terms.results[0] : Array.isArray(terms) ? terms[0] : terms;
      setActiveTerm(active || null);
      if (active?.start_date && active?.end_date) {
        setTermWeekdays(getWeekdaysBetween(active.start_date, active.end_date));
      }
    } catch (error) {
      console.error('Error fetching active term:', error);
    }
  };
  const checkUserRole = async () => {
    try {
      const user = await api.users.me();
      setUserRole(user.role || '');
      
      // If teacher, get their assigned classes
      if (user.role === 'teacher') {
        try {
          const [myClasses, assignments] = await Promise.all([
            api.users.myClasses(),
            api.users.myTeachingAssignments()
          ]);
          const classIds = myClasses.map((c: any) => c.id);
          setTeacherClassIds(classIds);
          
          // Check if teacher is a class teacher
          const isClassTeach = assignments?.is_class_teacher || false;
          setIsClassTeacher(isClassTeach);
          
          // If subject teacher only (not class teacher), restrict access
          if (!isClassTeach) {
            setRestrictedDueToRole(true);
          }
        } catch (error) {
          console.error('Error fetching teacher information:', error);
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };
  const loadClasses = async () => {
    try {
      setClassesLoading(true);
      const data = await api.classes.list({ page_size: 200, status: 'active' });
      let allClasses = data.results || data || [];
      
      // Filter classes for teachers
      if (userRole === 'teacher' && teacherClassIds.length > 0) {
        allClasses = allClasses.filter((c: any) => teacherClassIds.includes(c.id));
      }
      
      setClasses(allClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  const handleSummaryClassChange = async (classId: string) => {
    setSummaryClassId(classId);
    setSummaryError('');
    setSummaryData([]);

    if (!classId) return;
    if (!activeTerm?.start_date || !activeTerm?.end_date) {
      setSummaryError('Active term dates are required to build the summary.');
      return;
    }

    try {
      setSummaryLoading(true);
      const [studentsData, attendanceData] = await Promise.all([
        api.classes.students(classId),
        api.attendance.list({ page_size: 1200, class_obj: classId })
      ]);

      const students = studentsData.results || studentsData || [];
      const records = attendanceData.results || attendanceData || [];

      const termStart = new Date(activeTerm.start_date);
      const termEnd = new Date(activeTerm.end_date);
      const workingDays = termWeekdays.length;
      const attendedStatuses: AttendanceStatus[] = ['present', 'late'];

      const withinTerm = records.filter((r: any) => {
        const d = new Date(r.date);
        return d >= termStart && d <= termEnd;
      });

      const summary = students.map((s: any) => {
        const studentRecords = withinTerm.filter((r: any) => r.student === s.id);
        const attended = studentRecords.filter((r: any) => attendedStatuses.includes(r.status)).length;
        const rate = workingDays ? Math.round((attended / workingDays) * 100) : 0;
        return {
          id: s.id,
          full_name: s.full_name,
          attended,
          total: workingDays,
          rate,
        };
      });

      setSummaryData(summary);
    } catch (error: any) {
      console.error('Error loading attendance summary:', error);
      setSummaryError(error?.message || 'Failed to load summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setAttendanceError('');
    setClassStudents([]);

    if (!classId) return;

    try {
      setStudentsLoading(true);
      const [studentsData, attendanceData] = await Promise.all([
        api.classes.students(classId),
        api.attendance.list({ page_size: 1000, class_obj: classId })
      ]);
      
      const students = studentsData.results || studentsData || [];
      setClassStudents(students);
      
      const records = attendanceData.results || attendanceData || [];
      const draftMap: Record<number, Record<string, AttendanceStatus>> = {};
      
      records.forEach((record: any) => {
        const studentId = record.student;
        const date = record.date;
        const status = record.status as AttendanceStatus;
        
        if (!draftMap[studentId]) {
          draftMap[studentId] = {};
        }
        draftMap[studentId][date] = status;
      });
      
      setAttendanceDraft(draftMap);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const cycleStatus = (current?: AttendanceStatus) => {
    if (!current) return statusOrder[0];
    const idx = statusOrder.indexOf(current);
    if (idx === -1 || idx === statusOrder.length - 1) return undefined;
    return statusOrder[idx + 1];
  };

  const toggleAttendance = (studentId: number, date: string) => {
    setAttendanceDraft((prev) => {
      const studentEntry = prev[studentId] ? { ...prev[studentId] } : {};
      const next = cycleStatus(studentEntry[date]);

      if (!next) {
        delete studentEntry[date];
      } else {
        studentEntry[date] = next;
      }

      const updated = { ...prev, [studentId]: studentEntry };
      if (Object.keys(studentEntry).length === 0) {
        delete updated[studentId];
      }

      return { ...updated };
    });
  };

  const handleSaveAttendance = async () => {
    setAttendanceError('');

    if (!selectedClassId) {
      setAttendanceError('Choose a class to mark attendance.');
      return;
    }

    const payload: any[] = [];

    Object.entries(attendanceDraft).forEach(([studentId, dates]) => {
      Object.entries(dates).forEach(([date, status]) => {
        payload.push({
          student: Number(studentId),
          class_obj: Number(selectedClassId),
          date,
          status,
        });
      });
    });

    if (!payload.length) {
      setAttendanceError('Select at least one attendance cell to save.');
      return;
    }

    try {
      setSavingAttendance(true);
      console.log('Saving attendance payload:', JSON.stringify(payload, null, 2));
      const result = await api.attendance.bulkMark(payload);
      console.log('Attendance saved successfully:', result);
      
      // Small delay to ensure backend has time to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await fetchAttendance();
      // Keep modal open, keep draft intact - user can continue marking
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      const errorMsg = error?.message || JSON.stringify(error) || 'Failed to save attendance.';
      setAttendanceError(errorMsg);
    } finally {
      setSavingAttendance(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return attendanceSummaries.filter((record) =>
      record.class_name?.toLowerCase().includes(term) ||
      formatDate(record.date).includes(searchTerm)
    );
  }, [attendanceSummaries, searchTerm]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (record: AttendanceSummary) => record.date ? formatDate(record.date) : 'N/A',
    },
    { key: 'class_name', header: 'Class' },
    { key: 'present', header: 'Present' },
    { key: 'absent', header: 'Absent' },
    { key: 'late', header: 'Late' },
    { key: 'excused', header: 'Excused' },
    { key: 'total', header: 'Total Marked' },
  ];

  const renderAttendanceGrid = () => {
    if (!selectedClassId) {
      return <div className="text-sm text-gray-600">Select a class to load students.</div>;
    }

    if (studentsLoading) {
      return <div className="text-sm text-gray-600">Loading students...</div>;
    }

    if (!classStudents.length) {
      return <div className="text-sm text-gray-600">No students found for this class.</div>;
    }

    if (!termWeekdays.length) {
      return <div className="text-sm text-gray-600">No active term dates available.</div>;
    }

    const today = new Date().toISOString().split('T')[0];
    const colWidth = 100;
    const visibleCols = 10;
    const maxScroll = Math.max(0, (termWeekdays.length - visibleCols) * colWidth);

    const handleScrollLeft = () => {
      const gridEl = document.getElementById('attendance-grid-scroll');
      if (gridEl) {
        const newPos = Math.max(0, gridScrollPosition - colWidth);
        setGridScrollPosition(newPos);
        gridEl.style.transform = `translateX(-${newPos}px)`;
      }
    };

    const handleScrollRight = () => {
      const gridEl = document.getElementById('attendance-grid-scroll');
      if (gridEl) {
        const newPos = Math.min(maxScroll, gridScrollPosition + colWidth);
        setGridScrollPosition(newPos);
        gridEl.style.transform = `translateX(-${newPos}px)`;
      }
    };

    return (
      <div className="flex flex-col space-y-2">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="relative" style={{ width: `${visibleCols * colWidth + 140}px`, overflow: 'hidden' }}>
            <div
              id="attendance-grid-scroll"
              style={{
                display: 'inline-block',
                transition: 'transform 0.3s ease-in-out',
                transform: `translateX(-${gridScrollPosition}px)`,
              }}
            >
              <table className="divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap" style={{ width: '140px', minWidth: '140px' }}>
                      Student
                    </th>
                    {termWeekdays.map((date) => {
                      const isToday = date === today;
                      return (
                        <th
                          key={date}
                          className={`px-3 py-3 text-xs font-semibold whitespace-nowrap text-center ${
                            isToday
                              ? 'bg-blue-100 text-blue-900 font-bold'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                          style={{ width: `${colWidth}px`, minWidth: `${colWidth}px` }}
                        >
                          {formatDate(date)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classStudents.map((student) => (
                    <tr key={student.id} className="bg-white hover:bg-gray-50">
                      <td className="bg-white px-4 py-2 text-sm font-medium text-gray-800 whitespace-nowrap" style={{ width: '140px', minWidth: '140px' }}>
                        {student.full_name}
                      </td>
                      {termWeekdays.map((date) => {
                        const isToday = date === today;
                        const status = attendanceDraft[student.id]?.[date];
                        const baseStyle = status ? statusStyles[status] : 'bg-white text-gray-600 border border-gray-200';
                        const label = status ? statusLabels[status] : 'Set';

                        return (
                          <td
                            key={date}
                            className={`px-2 py-2 text-center align-middle ${isToday ? 'bg-blue-50' : ''}`}
                            style={{ width: `${colWidth}px`, minWidth: `${colWidth}px` }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleAttendance(student.id, date)}
                              className={`w-full text-xs px-2 py-2 rounded-md transition-colors ${baseStyle}`}
                            >
                              {label}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Arrow Navigation */}
        <div className="flex justify-center items-center space-x-4">
          <button
            type="button"
            onClick={handleScrollLeft}
            disabled={gridScrollPosition === 0}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll left"
          >
            ←
          </button>
          <span className="text-xs text-gray-500">
            {termWeekdays.length > visibleCols && `Showing ${Math.min(visibleCols, termWeekdays.length - Math.floor(gridScrollPosition / colWidth))} of ${termWeekdays.length} weeks`}
          </span>
          <button
            type="button"
            onClick={handleScrollRight}
            disabled={gridScrollPosition >= maxScroll}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {restrictedDueToRole && (
        <div className="p-8 text-center">
          <div className="card p-12 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-primary-800 mb-2">Access Denied</h2>
            <p className="text-primary-700 mb-4">
              Attendance marking is only available to class teachers.
            </p>
            <p className="text-primary-600 text-sm">
              You are currently assigned as a subject teacher. To access attendance marking, you need to be assigned as a class teacher for a class.
            </p>
            <div className="mt-6">
              <a href="/admin/results" className="text-blue-600 hover:underline">
                ← Go to Results Page
              </a>
            </div>
          </div>
        </div>
      )}
      
      {!restrictedDueToRole && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Today's Attendance"
          value={todayStats?.attendance_rate ? `${todayStats.attendance_rate.toFixed(1)}%` : '0%'}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Present Today"
          value={todayStats?.total_present?.toString() || '0'}
          icon={<FiUser className="w-6 h-6" />}
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Absent Today"
          value={todayStats?.total_absent?.toString() || '0'}
          icon={<FiXCircle className="w-6 h-6" />}
          color="primary"
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Total Students"
          value={todayStats?.total_students?.toString() || '0'}
          icon={<FiBook className="w-6 h-6" />}
          color="purple"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Class Attendance Records</h3>
            <p className="text-sm text-gray-500">Recent class-day summaries instead of individual student rows.</p>
          </div>
          <div className="flex space-x-3 items-center">
            <input
              type="text"
              placeholder="Search by class or date..."
              className="input-field w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                setShowSummaryModal(true);
                setSummaryError('');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiBarChart2 className="w-4 h-4" />
              <span>Attendance Summary</span>
            </button>
            <button
              onClick={() => {
                setShowMarkModal(true);
                setAttendanceError('');
              }}
              className="bg-primary-600 hover:bg-[#ffe600] text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Record Attendance</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredAttendance} />
      </div>

      {showMarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold">Record Class Attendance</h3>
                <p className="text-sm text-gray-500">
                  {activeTerm ? `Active term: ${formatDate(activeTerm.start_date)} - ${formatDate(activeTerm.end_date)}` : 'No active academic term found.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMarkModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="input-field w-full"
                    disabled={classesLoading}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {classesLoading && <p className="text-xs text-gray-500 mt-1">Loading classes...</p>}
                </div>
                <div className="flex items-end justify-end space-x-2 text-xs text-gray-600">
                  <span className="px-2 py-1 rounded-md border border-green-200 bg-green-50 text-green-700">Present</span>
                  <span className="px-2 py-1 rounded-md border border-primary-200 bg-primary-50 text-primary-700">Absent</span>
                  <span className="px-2 py-1 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-700">Late</span>
                  <span className="px-2 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">Excused</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Tap a cell to cycle through Present → Absent → Late → Excused. The grid shows every weekday between the active term start and end dates and supports horizontal scrolling.
                </p>
                {renderAttendanceGrid()}
              </div>

              {attendanceError && (
                <div className="text-sm text-primary-600">{attendanceError}</div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowMarkModal(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance || !selectedClassId}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingAttendance ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold">Attendance Summary</h3>
                <p className="text-sm text-gray-500">
                  {activeTerm ? `Active term: ${formatDate(activeTerm.start_date)} - ${formatDate(activeTerm.end_date)}` : 'No active academic term found.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={summaryClassId}
                    onChange={(e) => handleSummaryClassChange(e.target.value)}
                    className="input-field w-full"
                    disabled={classesLoading}
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {classesLoading && <p className="text-xs text-gray-500 mt-1">Loading classes...</p>}
                </div>
                <div className="text-xs text-gray-600 text-right">
                  {termWeekdays.length > 0 && `Working days this term: ${termWeekdays.length}`}
                </div>
              </div>

              {summaryError && <div className="text-sm text-primary-600">{summaryError}</div>}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Attended</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Total Days</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {summaryLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-600">Loading summary...</td>
                        </tr>
                      ) : summaryData.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-600">No data to display.</td>
                        </tr>
                      ) : (
                        summaryData.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-3 text-sm text-gray-800">{row.full_name}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">{row.attended}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">{row.total}</td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">{row.rate}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
