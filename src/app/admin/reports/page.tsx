'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiUser, FiCalendar, FiPrinter, FiDownload, FiSearch, FiPlus, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { api } from '@/lib/api';
import MarksEntryForm from '@/components/MarksEntryForm';
import DataTable from '@/components/DataTable';
import PrintableReportCard from '@/components/PrintableReportCard';

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [reportCard, setReportCard] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [term, setTerm] = useState('1');
  const [year, setYear] = useState('');
  const [availableTerms, setAvailableTerms] = useState<any[]>([]);
  const [isMarksEntryOpen, setIsMarksEntryOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [studentsWithTotals, setStudentsWithTotals] = useState<any[]>([]);
  const [showTermlyReport, setShowTermlyReport] = useState(false);
  const [termReports, setTermReports] = useState<any[]>([]);
  const [selectedTermReport, setSelectedTermReport] = useState<any>(null);
  const [termReportMode, setTermReportMode] = useState('create');
  const [selectedReportClass, setSelectedReportClass] = useState('');
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [termAttendance, setTermAttendance] = useState<{ totalDays: number; presentDays: number; absentDays: number; attendanceRate: number } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Parent-specific state
  const [userRole, setUserRole] = useState<string>('');
  const [myChildren, setMyChildren] = useState<any[]>([]);
  const [isParent, setIsParent] = useState(false);

  // Cleanup PDF URL when component unmounts or new PDF is generated
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    fetchInitialData();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await api.users.me();
      setUserRole(user.role);
      
      if (user.role === 'parent') {
        setIsParent(true);
        // Fetch parent's children
        const studentsData = await api.students.list();
        const allStudentsList = Array.isArray(studentsData) ? studentsData : studentsData.results || [];
        
        // Filter to only show parent's children (backend links these via user.children)
        // For now, we'll match by parent_phone in student records
        const childrenList = allStudentsList.filter((student: any) => 
          student.parent_phone === user.phone
        );
        
        setMyChildren(childrenList);
        setStudents(childrenList);
        setAllStudents(childrenList);
        
        // Auto-select first child if available
        if (childrenList.length > 0) {
          setSelectedStudent(childrenList[0].id.toString());
          if (childrenList[0].current_class) {
            setSelectedClass(childrenList[0].current_class.id?.toString() || childrenList[0].current_class.toString());
          }
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchTermReports();
    }
  }, [selectedClass, term, year]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classesData, studentsData, examsData, subjectsData, termsData] = await Promise.all([
        api.classes.list(),
        api.students.list(),
        api.exams.list(),
        api.subjects.list(),
        api.results.academicTerms.list()
      ]);
      
      setClasses(Array.isArray(classesData) ? classesData : classesData.results || []);
      const studentsList = Array.isArray(studentsData) ? studentsData : studentsData.results || [];
      if (userRole !== 'parent' && !isParent) {
        setAllStudents(studentsList);
        setStudents(studentsList);
      }
      setExams(Array.isArray(examsData) ? examsData : examsData.results || []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : subjectsData.results || []);
      setAvailableTerms(Array.isArray(termsData) ? termsData : termsData.results || []);
      
      const currentYear = new Date().getFullYear();
      setYear(currentYear.toString());
    } catch (error) {
      console.error('Error fetching initial data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTermReports = async () => {
    if (!selectedClass || !term || !year) return;

    try {
      const reportsData = await api.results.termReports.list({
        class_id: selectedClass,
        term,
        academic_year: year,
      });
      const reports = Array.isArray(reportsData) ? reportsData : reportsData.results || [];
      setTermReports(reports);

      if (selectedClass) {
        const totals = calculateTotals(reports);
        setStudentsWithTotals(totals);
      }
    } catch (error) {
      console.error('Error fetching term reports:', error);
    }
  };

  const calculateTotals = (reports: any[]) => {
    const studentTotals: { [key: string]: any } = {};

    reports.forEach((report: any) => {
      const studentId = report.student;
      if (!studentTotals[studentId]) {
        studentTotals[studentId] = {
          student_id: studentId,
          student_name: report.student_name,
          total: 0,
          entries_count: 0,
        };
      }

      if (report.entries && Array.isArray(report.entries)) {
        report.entries.forEach((entry: any) => {
          studentTotals[studentId].total += entry.total_score;
          studentTotals[studentId].entries_count += 1;
        });
      }
    });

    return Object.values(studentTotals).map((student: any) => ({
      ...student,
      average: student.entries_count > 0 ? (student.total / student.entries_count).toFixed(2) : '0.00',
    }));
  };

  const getSelectedTermRange = () => {
    const selectedTerm = availableTerms.find((t) => t.term === parseInt(term));
    if (selectedTerm) {
      return {
        start_date: selectedTerm.start_date,
        end_date: selectedTerm.end_date,
      };
    }
    return null;
  };

  const fetchTermAttendanceForTerm = async (studentId: string) => {
    const termRange = getSelectedTermRange();
    if (!termRange) {
      console.error('No term range found');
      return null;
    }

    try {
      const response = await api.attendance.list({
        student: studentId,
        date_from: termRange.start_date,
        date_to: termRange.end_date,
      });

      // Handle paginated response
      const attendanceRecords = Array.isArray(response) ? response : (response.results || []);
      
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter((record: any) => record.status === 'present').length;
      const absentDays = totalDays - presentDays;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        totalDays,
        presentDays,
        absentDays,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return null;
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedReportClass(classId); // Sync selectedReportClass with selectedClass
    setSelectedStudent('');
    
    if (classId) {
      const classIdNum = parseInt(classId);
      const filteredStudents = allStudents.filter((s: any) => {
        const studentClassId = typeof s.current_class === 'object' 
          ? s.current_class?.id
          : s.current_class;

        return studentClassId === classIdNum;
      });

      console.log(`Filtered ${filteredStudents.length} students for class ${classIdNum}`, filteredStudents);
      setStudents(filteredStudents);
    } else {
      setStudents(allStudents);
    }
  };

  const handlePrintReport = () => {
    if (!pdfUrl) {
      alert('PDF preview not available');
      return;
    }

    const printWindow = window.open(pdfUrl, '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report');
      return;
    }
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleGenerateReport = async () => {
    if (!selectedStudent || !term || !year) {
      alert('Please select a student, term, and year');
      return;
    }

    try {
      setReportLoading(true);
      setTermAttendance(null);
      
      // Fetch term reports for this term and year
      const termReportsData = await api.results.termReports.list({
        academic_year: year,
        term: term
      });
      const termReports = termReportsData.results || termReportsData;
      
      if (termReports.length === 0) {
        alert('No reports available for this term and year');
        setReportLoading(false);
        return;
      }
      
      const termReportIds = termReports.map((tr: any) => tr.id);
      
      // Fetch all entries for this student across all term reports for this term
      const entriesData = await api.results.termReportEntries.list({
        student: selectedStudent,
        term_report__in: termReportIds.join(',')
      });
      let studentEntries = entriesData.results || entriesData;
      
      if (studentEntries.length === 0) {
        alert('No marks found for this student in this term');
        setReportLoading(false);
        return;
      }

      // Deduplicate entries by subject - keep only the latest entry for each subject
      const uniqueEntriesBySubject = new Map();
      studentEntries.forEach((entry: any) => {
        const subjectId = entry.subject;
        if (!uniqueEntriesBySubject.has(subjectId) || 
            new Date(entry.created_at) > new Date(uniqueEntriesBySubject.get(subjectId).created_at)) {
          uniqueEntriesBySubject.set(subjectId, entry);
        }
      });
      studentEntries = Array.from(uniqueEntriesBySubject.values());
      
      // Build report card from entries
      const selectedStudentData = students.find((s: any) => s.id === parseInt(selectedStudent));
      
      // Get the student's class for the selected academic year from enrollment records
      let studentClassForYear = selectedStudentData?.current_class;
      try {
        const enrollmentsData = await api.enrollments.list({ 
          student: selectedStudent,
          academic_year: year
        });
        const enrollments = enrollmentsData.results || enrollmentsData;
        if (enrollments.length > 0) {
          const enrollment = enrollments[0];
          studentClassForYear = typeof enrollment.class_enrolled === 'object' 
            ? enrollment.class_enrolled 
            : enrollment.class_enrolled;
        }
      } catch (err) {
        console.error('Failed to fetch enrollment for year:', err);
      }
      
      // Calculate average marks - ensure proper type conversion
      const totalMarks = studentEntries.reduce((sum: number, entry: any) => {
        const marks = parseFloat(entry.marks_obtained) || 0;
        return sum + marks;
      }, 0);
      const averageMarks = studentEntries.length > 0 ? Math.round(totalMarks / studentEntries.length) : 0;
      
      console.log('Student Entries:', studentEntries);
      console.log('Total Marks:', totalMarks);
      console.log('Average Marks:', averageMarks);
      
      // Determine grade based on average (A≥80, B≥70, C≥60, D≥50, F<50)
      let grade = 'F';
      if (averageMarks >= 80) grade = 'A';
      else if (averageMarks >= 70) grade = 'B';
      else if (averageMarks >= 60) grade = 'C';
      else if (averageMarks >= 50) grade = 'D';
      
      // Calculate class position by fetching all students' averages in the same class
      let position = 'N/A';
      let classSize: number | null = null;
      try {
        // Get the student's class for the selected academic year
        let studentClass = studentClassForYear;
        if (typeof studentClass === 'object') {
          studentClass = studentClass?.id;
        }
        
        if (studentClass) {
          // Get all enrollments for the selected academic year in this class
          const classEnrollmentsData = await api.enrollments.list({ 
            class_enrolled: studentClass,
            academic_year: year
          });
          const classEnrollments = classEnrollmentsData.results || classEnrollmentsData;
          const classStudentIds = classEnrollments.map((e: any) => e.student);
          classSize = new Set(classStudentIds).size;
          
          // Calculate average marks for each student in the same class for this academic year
          const studentAverages = await Promise.all(
            classStudentIds.map(async (studentId: number) => {
              try {
                const studentEntriesData = await api.results.termReportEntries.list({
                  student: studentId,
                  term_report__in: termReportIds.join(',')
                });
                const entries = studentEntriesData.results || studentEntriesData;
                
                // Deduplicate by subject
                const uniqueBySubject = new Map();
                entries.forEach((entry: any) => {
                  const subjectId = entry.subject;
                  if (!uniqueBySubject.has(subjectId) || 
                      new Date(entry.created_at) > new Date(uniqueBySubject.get(subjectId).created_at)) {
                    uniqueBySubject.set(subjectId, entry);
                  }
                });
                const uniqueEntries = Array.from(uniqueBySubject.values());
                
                const total = uniqueEntries.reduce((sum: number, entry: any) => {
                  return sum + (parseFloat(entry.marks_obtained) || 0);
                }, 0);
                const avg = uniqueEntries.length > 0 ? total / uniqueEntries.length : 0;
                
                return { studentId: studentId, average: avg };
              } catch {
                return { studentId: studentId, average: 0 };
              }
            })
          );
          
          // Sort by average descending to determine position
          const sortedAverages = studentAverages
            .filter(s => s.average > 0)
            .sort((a, b) => b.average - a.average);
          
          const studentPosition = sortedAverages.findIndex(s => s.studentId === parseInt(selectedStudent)) + 1;
          position = studentPosition > 0 ? studentPosition.toString() : 'N/A';
        }
      } catch (posErr) {
        console.error('Failed to calculate position:', posErr);
      }
      
      const reportCard = {
        id: selectedStudent,
        student: selectedStudent,
        student_name: selectedStudentData?.full_name || `${selectedStudentData?.first_name} ${selectedStudentData?.last_name}`,
        student_id: selectedStudentData?.student_id,
        class_size: classSize,
        class_name: typeof studentClassForYear === 'object' ? studentClassForYear?.name : studentClassForYear,
        academic_year: year,
        term: term,
        marks_obtained: Number(averageMarks),
        total_marks: 100,
        percentage: Number(averageMarks),
        grade: grade,
        position: position,
        results: studentEntries.map((entry: any) => ({
          ...entry,
          marks_obtained: parseFloat(entry.marks_obtained) || 0
        }))
      };
      
      await fetchTermAttendanceForTerm(selectedStudent);
      setReportCard(reportCard);

      // Fetch Excel report for this student (for download/display)
      try {
        const classIdToUse = selectedClass || selectedReportClass;
        if (classIdToUse) {
          const excelBlob = await api.results.termReports.exportPdf({
            class_id: parseInt(classIdToUse),
            academic_year: year,
            term: parseInt(term),
            student_id: parseInt(selectedStudent)
          });
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
          // Create a blob URL for the Excel file (for download)
          const url = URL.createObjectURL(excelBlob as any);
          setPdfUrl(url);
        }
      } catch (excelErr) {
        console.error('Failed to load Excel report:', excelErr);
        setPdfUrl(null);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleCreateTermlyReport = async () => {
    if (!selectedReportClass) {
      alert('Please select a class');
      return;
    }
    if (!term || !year) {
      alert('Please select term and year');
      return;
    }

    try {
      setReportLoading(true);
      // Create term report in database
      const response = await api.results.termReports.createReport({
        class_id: parseInt(selectedReportClass),
        academic_year: year,
        term: parseInt(term)
      });

      setSelectedTermReport(response);
      setTermReportMode('entry');
      fetchTermReports();

      // Fetch students for the selected class from the API
      const studentsData = await api.students.list({
        current_class: parseInt(selectedReportClass)
      });
      const fetchedStudents = studentsData.results || studentsData;

      if (fetchedStudents.length === 0) {
        alert('No students found in this class');
      }

      setClassStudents(fetchedStudents);
      loadMarkSheetForClass(fetchedStudents, response.id);
    } catch (error) {
      console.error('Failed to create term report:', error);
      alert('Failed to create term report');
    } finally {
      setReportLoading(false);
    }
  };

  const loadMarkSheetForClass = async (studentsData: any[], termReportId: any) => {
    const studentsWithScores = studentsData.map((student: any) => ({
      id: student.id,
      name: student.full_name || `${student.first_name} ${student.last_name}`,
      classId: typeof student.current_class === 'object' ? student.current_class?.id : student.current_class,
      className: typeof student.current_class === 'object' ? student.current_class?.name : student.class_name,
      classTeacher: typeof student.current_class === 'object' ? student.current_class?.teacher_name : student.class_teacher || 'N/A',
      termReportId: termReportId,
      scores: subjects.reduce((acc: any, subject: any) => {
        acc[subject.id] = 0;
        return acc;
      }, {})
    }));

    setStudentsWithTotals(calculateTotals(studentsWithScores));
    setShowTermlyReport(true);
  };

  const handleSelectExistingReport = async (reportId: string) => {
    const selected = termReports.find((r: any) => r.id === reportId);
    if (selected) {
      setSelectedTermReport(selected);
      setSelectedReportClass(selected.class_obj.toString());
      setTermReportMode('entry');

      // Fetch students for the class from the API
      const studentsData = await api.students.list({
        current_class: selected.class_obj
      });
      const fetchedStudents = studentsData.results || studentsData;

      setClassStudents(fetchedStudents);
      loadMarkSheetForClass(fetchedStudents, selected.id);
    }
  };

  const handleDownloadExcel = async () => {
    const classIdToUse = selectedReportClass || selectedClass;
    if (!classIdToUse || !term || !year) {
      alert('Please select a class, term, and year first');
      return;
    }

    try {
      setReportLoading(true);
      console.log('Downloading Excel report for class:', classIdToUse, 'term:', term, 'year:', year);
      
      // Call the backend API to generate and download Excel
      const response = await api.results.termReports.exportExcel({
        class_id: parseInt(classIdToUse),
        academic_year: year,
        term: parseInt(term)
      });
      
      // The response should be a blob (the Excel file)
      // Create a download link
      const url = window.URL.createObjectURL(response as any);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedClass}-Term${term}-${year.replace('/', '-')}-Report.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Excel report downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading Excel report:', error);
      alert(`Failed to download Excel report: ${error.message || 'Unknown error'}`);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    const classIdToUse = selectedReportClass || selectedClass;
    if (!classIdToUse || !term || !year || !selectedStudent) {
      alert('Please select a student, class, term, and year first');
      return;
    }

    try {
      setReportLoading(true);
      const pdfBlob = await api.results.termReports.exportStudentPdf({
        class_id: parseInt(classIdToUse),
        academic_year: year,
        term: parseInt(term),
        student_id: parseInt(selectedStudent)
      });

      const url = window.URL.createObjectURL(pdfBlob as any);
      const link = document.createElement('a');
      link.href = url;
      const studentName = reportCard?.student_name?.replace(/\s+/g, '_') || 'Report';
      link.download = `${studentName}_Report_${year}_Term${term}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setReportLoading(false);
    }
  };

  // Update score when input changes
  const updateScore = (studentId: any, subjectId: any, value: any) => {
    setStudentsWithTotals(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id === studentId) {
          const newScores = { ...student.scores, [subjectId]: parseInt(value) || 0 };
          return { ...student, scores: newScores };
        }
        return student;
      });
      // Recalculate totals and positions after updating scores
      return calculateTotals(updatedStudents);
    });
  };

  const handleSaveMarks = async () => {
    if (!selectedTermReport) {
      alert('No term report selected');
      return;
    }

    try {
      setReportLoading(true);
      // Flatten the student scores into individual entries (one per subject)
      const entries = studentsWithTotals.flatMap(student =>
        Object.keys(student.scores).map(subjectId => ({
          student_id: student.id,
          subject_id: parseInt(subjectId),
          marks_obtained: student.scores[subjectId] || 0
        }))
      );

      const response = await api.results.termReportEntries.bulkCreate({
        term_report_id: selectedTermReport.id,
        entries: entries
      });

      alert('Marks saved successfully!');
      setShowTermlyReport(false);
      setStudentsWithTotals([]);
      setSelectedTermReport(null);
      setTermReportMode('');
    } catch (error) {
      console.error('Failed to save marks:', error);
      alert('Failed to save marks');
    } finally {
      setReportLoading(false);
    }
  };

  const createColumns = () => {
    const columns = [
      { key: 'name', header: 'Student Name' },
      { key: 'className', header: 'Class' }
    ];

    // Add a column for each subject with input field
    subjects.forEach(subject => {
      columns.push({
        key: `subject_${subject.id}`,
        header: subject.name,
        render: (student: any) => (
          <input
            type="number"
            min="0"
            max="100"
            className="input-field w-20"
            value={student.scores[subject.id] || ''}
            onChange={(e) => updateScore(student.id, subject.id, e.target.value)}
          />
        )
      } as any);
    });

    // Add total column
    columns.push({
      key: 'total',
      header: 'Total',
      render: (student: any) => student.total || 0
    } as any);

    return columns;
  };

  return (
    <div className="px-0 pt-4 sm:p-8">
      {/* View Report Cards Section */}
      <>
        {/* Filters for Report Card */}
        <div className="card p-4 sm:p-6 mb-6 mx-0 sm:mx-0">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Select Student & Term</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="label">Select Class</label>
                <select
                  className="input-field"
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Select Student</label>
                <select
                  className="input-field"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!selectedClass || students.length === 0}
                >
                  <option value="">
                    {!selectedClass ? 'Select class first' : students.length === 0 ? 'No students in this class' : 'Select a student'}
                  </option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.full_name || `${student.first_name} ${student.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select
                  className="input-field"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {Array.from(new Set(availableTerms.map((term: any) => term.academic_year))).map((y: string) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
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
              <div className="flex items-end">
                <button
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                >
                  <FiSearch className="w-4 h-4" />
                  {reportLoading ? 'Loading...' : 'View Report'}
                </button>
              </div>
            </div>
          </div>
        </>
      
        {/* Report Display - Display when a report is selected */}
        {reportCard && (
          <>
            {/* Printable Report Card */}
            <div className="overflow-x-auto">
              <div className="min-w-[320px]">
                <PrintableReportCard
                  studentName={reportCard.student_name}
                  studentId={reportCard.student_id}
                  className={reportCard.class_name}
                  term={parseInt(term)}
                  academicYear={year}
                  position={reportCard.position}
                  attendance={termAttendance ? `${(termAttendance as any).presentDays || (termAttendance as any).present_days || 0}/${(termAttendance as any).totalDays || (termAttendance as any).total_days || 0}` : '0/0'}
                  subjects={reportCard.results.map((entry: any) => {
                    const subject = subjects.find(s => s.id === entry.subject);
                    const totalScore = parseFloat(entry.marks_obtained) || 0;
                    // Split into 50% class score and 50% exam score
                    const classScore = Math.round(totalScore / 2);
                    const examScore = totalScore - classScore;
                    
                    // Determine grade
                    let grade = 'F';
                    if (totalScore >= 91) grade = 'A+';
                    else if (totalScore >= 81) grade = 'A';
                    else if (totalScore >= 71) grade = 'B';
                    else if (totalScore >= 61) grade = 'C';
                    else if (totalScore >= 51) grade = 'D';
                    else if (totalScore >= 35) grade = 'E';
                    
                    // Determine remarks
                    let remarks = '';
                    if (totalScore >= 80) remarks = 'Outstanding';
                    else if (totalScore >= 70) remarks = 'Very Good';
                    else if (totalScore >= 60) remarks = 'Good';
                    else if (totalScore >= 50) remarks = 'Average';
                    
                    return {
                      name: subject?.name || 'Unknown',
                      classScore,
                      examScore,
                      totalScore,
                      grade,
                      remarks
                    };
                  })}
                  rollNo={reportCard.class_size ?? reportCard.student_id}
                  overallGrade={reportCard.grade}
                  overallPercentage={reportCard.percentage}
                  classTeacher="Leticia Baidoo"
                  teacherRemarks="0"
                />
              </div>
            </div>

            {/* Download Class Excel Button */}
            {userRole !== 'parent' && (
              <div className="flex justify-center mt-6">
                <button onClick={handleDownloadExcel} disabled={reportLoading} className="btn-secondary flex items-center gap-2 w-full sm:w-auto">
                  <FiFileText className="w-4 h-4" />
                  {reportLoading ? 'Generating...' : 'Download Full Class Excel'}
                </button>
              </div>
            )}
          </>
        )}

    </div>
  );
}
