'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiUser, FiClock, FiCalendar, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { api } from '@/lib/api';

interface TimeSlot {
  period: string;
  startTime: string;
  endTime: string;
}

interface ClassSchedule {
  id: number;
  class_obj: number;
  subject: number;
  teacher: number | null;
  day: string;
  time_slot: number;
  room: string;
  academic_year: string;
  term: number;
  subject_name?: string;
  teacher_name?: string;
}

const initialTimeSlots: TimeSlot[] = [
  { period: 'Period 1', startTime: '08:00', endTime: '08:40' },
  { period: 'Period 2', startTime: '08:45', endTime: '09:25' },
  { period: 'Period 3', startTime: '09:30', endTime: '10:10' },
  { period: 'Break', startTime: '10:10', endTime: '10:30' },
  { period: 'Period 4', startTime: '10:30', endTime: '11:10' },
  { period: 'Period 5', startTime: '11:15', endTime: '11:55' },
  { period: 'Lunch', startTime: '11:55', endTime: '12:35' },
  { period: 'Period 6', startTime: '12:35', endTime: '13:15' },
  { period: 'Period 7', startTime: '13:20', endTime: '14:00' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetablePage() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState('2025');
  const [term, setTerm] = useState(1);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [teacherClassIds, setTeacherClassIds] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check user role first
      let myClasses: any[] = [];
      let userRole = '';
      try {
        const user = await api.users.me();
        userRole = user.role || '';
        setUserRole(userRole);
        
        // If teacher, get their assigned classes
        if (userRole === 'teacher') {
          myClasses = await api.users.myClasses();
          const classIds = myClasses.map((c: any) => c.id);
          setTeacherClassIds(classIds);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
      
      const [schedulesData, classesData, subjectsData, classSubjectsData, teachersData, timeSlotsData] = await Promise.all([
        api.timetable.list(),
        api.classes.list(),
        api.subjects.list(),
        api.subjects.classSubjects.list(),
        api.teachers.list(),
        api.timetable.timeSlots()
      ]);
      
      setSchedules(schedulesData.results || schedulesData);
      let classList = classesData.results || classesData;
      
      // Filter classes for teachers
      if (userRole === 'teacher' && myClasses.length > 0) {
        const classIds = myClasses.map((c: any) => c.id);
        classList = classList.filter((c: any) => classIds.includes(c.id));
      }
      
      setClasses(classList);
      setSubjects(subjectsData.results || subjectsData);
      setClassSubjects(classSubjectsData.results || classSubjectsData);
      setTeachers(teachersData.results || teachersData);
      setTimeSlots(timeSlotsData.results || timeSlotsData);
      if (classList.length > 0) {
        setSelectedClass(classList[0].name);
        setSelectedClassId(classList[0].id);
      }
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = async (day: string, timeSlotId: number, subjectId: string) => {
    if (!selectedClassId || !subjectId) return;

    try {
      setSaving(true);
      
      // Find existing schedule for this slot
      const existingSchedule = schedules.find(s => 
        s.class_obj === selectedClassId && 
        s.day === day.toLowerCase() && 
        s.time_slot === timeSlotId &&
        s.academic_year === academicYear &&
        s.term === term
      );

      const parsedSubjectId = parseInt(subjectId);
      // Find teacher from ClassSubject instead of Subject
      const classSubject = classSubjects.find(cs => 
        cs.class_obj === selectedClassId && cs.subject === parsedSubjectId
      );
      const teacherId = classSubject?.teacher || null;
      
      const scheduleData = {
        class_obj: selectedClassId,
        day: day.toLowerCase(),
        time_slot: timeSlotId,
        subject: parsedSubjectId,
        teacher: teacherId,
        room: existingSchedule?.room || '',
        academic_year: academicYear,
        term: term
      };

      if (existingSchedule) {
        const updated = await api.timetable.update(existingSchedule.id, scheduleData);
        setSchedules(prev => prev.map(s => 
          s.id === existingSchedule.id ? updated : s
        ));
      } else {
        const newSchedule = await api.timetable.create(scheduleData);
        setSchedules(prev => [...prev, newSchedule]);
      }
    } catch (error) {
      console.error('Error updating timetable:', error);
      alert('Failed to update timetable. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => 
    schedule.class_obj === selectedClassId &&
    schedule.academic_year === academicYear &&
    schedule.term === term
  );

  // Use actual time slots from backend
  const actualTimeSlots = timeSlots.length > 0 ? timeSlots : [];

  // Group schedules by day for the timetable view
  const groupedSchedules = daysOfWeek.map(day => ({
    day,
    periods: actualTimeSlots.map(slot => {
      const schedule = filteredSchedules.find(s => 
        s.day === day.toLowerCase() && s.time_slot === slot.id
      );
      return { ...slot, schedule };
    })
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Class Timetable</h2>
          <p className="text-gray-600">Manage and organize class schedules</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-2">No Time Slots Found</p>
          <p className="text-yellow-700 text-sm">
            Please contact the administrator to set up time slots before creating timetables.
          </p>
          <p className="text-yellow-600 text-xs mt-2">
            Run: <code className="bg-yellow-100 px-2 py-1 rounded">python manage.py create_timeslots</code> on the backend
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        {userRole === 'teacher' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can only view timetables for classes you teach.
            </p>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 pb-4 border-b border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const cls = classes.find(c => c.name === e.target.value);
                setSelectedClassId(cls?.id || null);
              }}
              className="input-field w-64"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="input-field w-32"
              placeholder="2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(parseInt(e.target.value))}
              className="input-field w-32"
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-gray-500">
            Click any cell to add or change a subject.
          </div>
        </div>

        {/* Timetable View */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-40">Day</th>
                {actualTimeSlots.map((slot) => (
                  <th key={slot.id} className="px-4 py-3 text-center bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200" style={{width: slot.is_break ? '120px' : '220px'}}>
                    <div className="text-gray-800 font-semibold text-sm normal-case">{slot.name}</div>
                    <div className="text-[11px] text-gray-500">
                      {typeof slot.start_time === 'string' ? slot.start_time : slot.start_time?.substring(0, 5)} -
                      {typeof slot.end_time === 'string' ? slot.end_time : slot.end_time?.substring(0, 5)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedSchedules.map((daySchedule, dayIndex) => (
                <tr key={dayIndex} className={dayIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="sticky left-0 z-10 bg-white px-4 py-4 text-sm font-semibold text-gray-800 border-b border-gray-200">
                    {daySchedule.day}
                  </td>
                  {daySchedule.periods.map((period) => (
                    <td key={period.id} className="px-3 py-3 align-top border-b border-gray-200" style={{width: period.is_break ? '120px' : '220px'}}>
                      {period.is_break ? (
                        <div className="h-full rounded-lg border border-dashed border-gray-300 bg-gray-100/70 text-center text-xs text-gray-500 py-4">
                          {period.name}
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm hover:shadow-md transition"
                          onClick={() => setEditingCell(`${daySchedule.day}-${period.id}`)}
                        >
                          {editingCell === `${daySchedule.day}-${period.id}` ? (
                            <select
                              value={period.schedule?.subject || ''}
                              onChange={(e) => {
                                handleSubjectChange(daySchedule.day, period.id, e.target.value);
                                setEditingCell(null);
                              }}
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              className="w-full p-2.5 text-sm font-medium border border-gray-300 rounded-lg bg-white"
                              disabled={saving}
                            >
                              <option value="">Select Subject</option>
                              {subjects.map(subject => (
                                <option key={subject.id} value={subject.id}>
                                  {subject.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {period.schedule
                                  ? subjects.find(s => s.id === period.schedule.subject)?.name || 'Unknown'
                                  : 'Click to add'}
                              </div>
                              {period.schedule && (
                                <div className="mt-1 text-[11px] text-gray-500 truncate" title={period.schedule.teacher_name || 'No teacher assigned'}>
                                  👤 {period.schedule.teacher_name?.split(' ')[0] || 'No teacher'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
