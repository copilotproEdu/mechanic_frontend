'use client';

import { useState, useEffect } from 'react';
import { FiAward, FiDownload, FiPrinter, FiSearch } from 'react-icons/fi';
import { api } from '@/lib/api';
import DataTable from '@/components/DataTable';

export default function OrderOfMeritPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [term, setTerm] = useState('1');
  const [year, setYear] = useState('');
  const [availableTerms, setAvailableTerms] = useState<any[]>([]);
  const [meritList, setMeritList] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [teacherClassIds, setTeacherClassIds] = useState<number[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (availableTerms && availableTerms.length > 0) {
      const uniqueYears = Array.from(new Set(availableTerms.map((t: any) => t.academic_year)));
      if (uniqueYears.length > 0 && !year) {
        setYear(uniqueYears[0] as string);
      }
    }
  }, [availableTerms]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Check user role first
      let myClasses: any[] = [];
      let userRole = '';
      try {
        const user = await api.users.me();
        userRole = user.role || '';
        setUserRole(userRole);
        
        // If teacher, get their assigned classes and check if class teacher
        if (userRole === 'teacher') {
          const classes = await api.users.myClasses();
          myClasses = classes;
          const classIds = myClasses.map((c: any) => c.id);
          setTeacherClassIds(classIds);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
      
      const [classesData, subjectsData, availableTermsData] = await Promise.all([
        api.classes.list(),
        api.subjects.list(),
        api.results.academicTerms.availableTerms(),
      ]);
      
      let allClasses = classesData.results || classesData;
      
      // Filter classes for teachers
      if (userRole === 'teacher' && myClasses.length > 0) {
        const classIds = myClasses.map((c: any) => c.id);
        allClasses = allClasses.filter((c: any) => classIds.includes(c.id));
      }
      
      setClasses(allClasses);
      setSubjects(subjectsData.results || subjectsData);
      const processedTerms = availableTermsData.results || availableTermsData;
      setAvailableTerms(processedTerms);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMerit = async () => {
    if (!selectedClass || !term || !year) {
      alert('Please select class, term, and year');
      return;
    }

    try {
      setReportLoading(true);
      
      // Get all students in the class
      const studentsData = await api.students.list({ current_class: parseInt(selectedClass) });
      const allStudents = studentsData.results || studentsData;
      
      console.log('=== DEBUG: All students in class ===', allStudents.length, allStudents.map((s: any) => ({ id: s.id, name: s.full_name || `${s.first_name} ${s.last_name}` })));
      
      if (allStudents.length === 0) {
        alert('No students found in this class');
        setReportLoading(false);
        return;
      }

      const studentIds = allStudents.map((s: any) => s.id);
      
      console.log('=== DEBUG: Student IDs ===', studentIds);
      
      // Get term reports for this term/year (ALL classes to capture all students)
      const termReportsData = await api.results.termReports.list({
        academic_year: year,
        term: term
      });
      const allTermReports = termReportsData.results || termReportsData;
      
      if (allTermReports.length === 0) {
        alert('No term reports found for this term and year');
        setReportLoading(false);
        return;
      }

      const termReportIds = allTermReports.map((tr: any) => tr.id);
      
      console.log('=== DEBUG: Term report IDs ===', termReportIds);
      
      // Get ALL entries for these term reports
      const entriesData = await api.results.termReportEntries.list({
        term_report__in: termReportIds.join(',')
      });
      const allEntriesRaw = entriesData.results || entriesData;
      
      console.log('=== DEBUG: Total entries fetched ===', allEntriesRaw.length);
      console.log('=== DEBUG: First 3 entries ===', allEntriesRaw.slice(0, 3).map((e: any) => ({ 
        student_id: e.student_id, 
        subject_id: e.subject_id, 
        marks: e.marks_obtained 
      })));
      
      // Filter entries to only students in the selected class
      const allEntries = allEntriesRaw.filter((entry: any) => {
        const studentId = entry.student_id || entry.student?.id || entry.student;
        return studentIds.includes(studentId);
      });
      
      console.log('=== DEBUG: Filtered entries for class ===', allEntries.length);
      console.log('=== DEBUG: Unique students in entries ===', Array.from(new Set(allEntries.map((e: any) => e.student_id))));
      
      if (allEntries.length === 0) {
        alert('No marks found for students in this class');
        setReportLoading(false);
        return;
      }

      // Group by student and calculate totals
      const studentScores: { [key: number]: any } = {};
      
      console.log('=== DEBUG: Starting to process entries ===');
      
      allEntries.forEach((entry: any, index: any) => {
        const studentId = entry.student_id || entry.student?.id || entry.student;
        const subjectId = entry.subject_id || entry.subject?.id || entry.subject;
        
        if (index < 10) {
          console.log(`Entry ${index}: student_id=${studentId}, subject_id=${subjectId}, marks=${entry.marks_obtained}`);
        }
        
        const student = allStudents.find((s: any) => s.id === studentId);
        if (!student) {
          if (index < 10) console.log(`  -> Student ${studentId} not found in allStudents`);
          return;
        }
        
        if (!studentScores[studentId]) {
          studentScores[studentId] = {
            studentId: studentId,
            studentName: student.full_name || `${student.first_name} ${student.last_name}`,
            className: typeof student.current_class === 'object' ? student.current_class?.name : student.current_class,
            subjectScores: {},
            grandTotal: 0
          };
          console.log(`  -> Created studentScores entry for student ${studentId} (${studentScores[studentId].studentName})`);
        }
        
        const subject = subjects.find((s: any) => s.id === subjectId);
        const subjectName = subject?.name || `Subject ${subjectId}`;
        const marks = parseFloat(entry.marks_obtained) || 0;
        
        if (studentScores[studentId].subjectScores[subjectName]) {
          studentScores[studentId].subjectScores[subjectName] += marks;
        } else {
          studentScores[studentId].subjectScores[subjectName] = marks;
        }
      });
      
      console.log('=== DEBUG: Student scores object ===', Object.keys(studentScores).length, 'students');
      Object.entries(studentScores).forEach(([id, data]: [string, any]) => {
        console.log(`  Student ${id} (${data.studentName}):`, Object.keys(data.subjectScores).length, 'subjects');
      });

      // Calculate totals and sort
      const meritData = Object.values(studentScores).map((student: any) => ({
        ...student,
        grandTotal: Object.values(student.subjectScores).reduce((sum: number, score: any) => sum + score, 0)
      }));

      if (meritData.length === 0) {
        alert('No students with marks found');
        setReportLoading(false);
        return;
      }

      const sortedMerit = meritData.sort((a, b) => b.grandTotal - a.grandTotal);
      const meritWithPositions = sortedMerit.map((student, index) => ({
        ...student,
        id: student.studentId,
        position: index + 1,
        positionSuffix: getPositionSuffix(index + 1)
      }));

      console.log('=== DEBUG: Final merit list ===', meritWithPositions.map((m: any) => ({ 
        id: m.studentId, 
        name: m.studentName, 
        total: m.grandTotal,
        position: m.position 
      })));

      setMeritList(meritWithPositions);

      // Calculate and save positions to report cards
      try {
        await api.results.reportCards.calculatePositions({
          class_id: parseInt(selectedClass),
          academic_year: year,
          term: term
        });
      } catch (err) {
        console.error('Failed to update report card positions:', err);
        // Don't fail the whole operation if position update fails
      }
    } catch (err) {
      console.error('Failed to generate order of merit:', err);
      alert('Failed to generate order of merit');
    } finally {
      setReportLoading(false);
    }
  };

  const getPositionSuffix = (position: number) => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('PDF download feature coming soon');
  };

  const createMeritColumns = () => {
    const columns: any[] = [
      {
        key: 'position',
        header: 'Position',
        render: (student: any) => (
          <div className="flex items-center gap-2">
            {student.position <= 3 && (
              <FiAward className={`w-5 h-5 ${
                student.position === 1 ? 'text-yellow-500' :
                student.position === 2 ? 'text-gray-400' :
                'text-amber-700'
              }`} />
            )}
            <span className="font-bold text-lg">{student.positionSuffix}</span>
          </div>
        )
      },
      { key: 'studentName', header: 'Student Name' },
    ];

    // Add columns for each subject
    if (meritList.length > 0) {
      const subjectNames = Object.keys(meritList[0].subjectScores);
      subjectNames.forEach(subjectName => {
        columns.push({
          key: `subject_${subjectName}`,
          header: subjectName,
          render: (student: any) => student.subjectScores[subjectName] || 0
        });
      });
    }

    // Add grand total column
    columns.push({
      key: 'grandTotal',
      header: 'Grand Total',
      render: (student: any) => (
        <span className="font-bold text-xl text-primary-600">{student.grandTotal}</span>
      )
    });

    return columns;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Filters */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Select Class, Term & Year</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Class</label>
            <select
              className="input-field"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Term</label>
            <select
              className="input-field"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              {year ? (
                Array.from(
                  new Set(
                    availableTerms
                      .filter((t: any) => t.academic_year?.toString() === year.toString())
                      .map((t: any) => t.term)
                  )
                ).map((uniqueTerm: number) => (
                  <option key={uniqueTerm} value={uniqueTerm}>
                    {uniqueTerm === 1 ? 'First Term' : uniqueTerm === 2 ? 'Second Term' : 'Third Term'}
                  </option>
                ))
              ) : (
                <option value="">Select a year first</option>
              )}
            </select>
          </div>

          <div>
            <label className="label">Year</label>
            <select
              className="input-field"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {availableTerms?.length > 0 && (
                Array.from(new Set(availableTerms.map((term: any) => term.academic_year))).map((y: string) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateMerit}
              disabled={reportLoading || !selectedClass || !term || !year}
              className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors bg-primary-600 text-white hover:bg-primary-700 w-full justify-center disabled:bg-gray-400"
            >
              <FiSearch className="w-4 h-4" />
              {reportLoading ? 'Loading...' : 'Generate Merit List'}
            </button>
          </div>
        </div>
      </div>

      {/* Merit List */}
      {meritList.length > 0 && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Order of Merit - {meritList[0].className} ({meritList.length} students)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiPrinter className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable columns={createMeritColumns()} data={meritList} />
          </div>

          {/* Top 3 Highlight */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {meritList.slice(0, 3).map((student, index) => (
              <div
                key={student.studentId}
                className={`p-4 rounded-lg border-2 ${
                  index === 0
                    ? 'border-yellow-500 bg-yellow-50'
                    : index === 1
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-amber-700 bg-amber-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FiAward
                    className={`w-6 h-6 ${
                      index === 0
                        ? 'text-yellow-500'
                        : index === 1
                        ? 'text-gray-400'
                        : 'text-amber-700'
                    }`}
                  />
                  <span className="font-bold text-lg">{student.positionSuffix}</span>
                </div>
                <h4 className="font-semibold text-lg mb-1">{student.studentName}</h4>
                <p className="text-2xl font-bold text-primary-600">{student.grandTotal} marks</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {meritList.length === 0 && !reportLoading && selectedClass && term && year && (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No data available. Please click &quot;Generate Merit List&quot; to load results.</p>
        </div>
      )}
    </div>
  );
}
