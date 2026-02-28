'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiBook, FiUser, FiCalendar, FiPrinter, FiDownload, FiSearch, FiPlus, FiCheckCircle, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';
import MarksEntryForm from '@/components/MarksEntryForm';
import DataTable from '@/components/DataTable';

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [reportCard, setReportCard] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [term, setTerm] = useState('1');
  const [year, setYear] = useState(''); // Initialize as empty - will be set from available terms
  const [availableTerms, setAvailableTerms] = useState<any[]>([]);
  const [isMarksEntryOpen, setIsMarksEntryOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [studentsWithTotals, setStudentsWithTotals] = useState<any[]>([]);
  const [showTermlyReport, setShowTermlyReport] = useState(false);
  const [termReports, setTermReports] = useState<any[]>([]);
  const [selectedTermReport, setSelectedTermReport] = useState<any>(null);
  const [termReportMode, setTermReportMode] = useState('create'); // 'create' or 'entry'
  const [selectedReportClass, setSelectedReportClass] = useState('');
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [viewMode, setViewMode] = useState<'entry' | 'totals'>('entry');
  const [userRole, setUserRole] = useState<string>('');
  const [teacherClassIds, setTeacherClassIds] = useState<number[]>([]);
  const [teacherClassTeacherIds, setTeacherClassTeacherIds] = useState<number[]>([]);
  const [teacherSubjectIds, setTeacherSubjectIds] = useState<number[]>([]);
  const [isTeacherClassTeacher, setIsTeacherClassTeacher] = useState(false);
  const [teachingAssignments, setTeachingAssignments] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-select the first available year when terms are loaded
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
      let allowedClassIds: number[] = [];
      let classTeacherIds: number[] = [];
      let assignmentData: any = null;
      let classesFromAssignments: any[] = [];
      try {
        const user = await api.users.me();
        userRole = user.role || '';
        setUserRole(userRole);

        if (userRole === 'parent') {
          router.push('/admin/reports');
          setLoading(false);
          return;
        }
        
        // If teacher, get their assigned classes and subjects
        if (userRole === 'teacher') {
          try {
            const [classes, assignments] = await Promise.all([
              api.users.myClasses().catch(e => { console.error('myClasses error:', e); return null; }),
              api.users.myTeachingAssignments().catch(e => { console.error('myTeachingAssignments error:', e); return null; })
            ]);
            myClasses = classes || [];
            const classIdsFromMyClasses = myClasses.map((c: any) => c.id).filter(Boolean);
            
          if (assignments) {
            assignmentData = assignments;
            setTeachingAssignments(assignments);
            setTeacherSubjectIds(assignments.assigned_subject_ids || []);
            setIsTeacherClassTeacher(assignments.is_class_teacher || false);

            const classTeacherFor = (assignments.class_teacher_for || []).map((cls: any) =>
              typeof cls === 'object' ? cls.id : cls
            ).filter(Boolean);
            classTeacherIds = classTeacherFor;
            setTeacherClassTeacherIds(classTeacherIds);

            const assignedClassIds = (assignments.assigned_class_ids || []).map((cls: any) =>
              typeof cls === 'object' ? cls.id : cls
            ).filter(Boolean);

            const teachingAssignmentClassIds = (assignments.teaching_assignments || [])
              .map((assignment: any) => assignment.class_id || assignment.class_obj?.id || assignment.class?.id || assignment.class_obj || assignment.class)
              .filter(Boolean)
              .map((id: any) => parseInt(id, 10));

            const uniqueClasses = new Map<number, any>();
            (assignments.teaching_assignments || []).forEach((assignment: any) => {
              const classId = parseInt(
                assignment.class_id || assignment.class_obj?.id || assignment.class?.id || assignment.class_obj || assignment.class,
                10
              );
              if (!Number.isNaN(classId)) {
                uniqueClasses.set(classId, {
                  id: classId,
                  name: assignment.class_name || assignment.class_obj?.name || assignment.class?.name || `Class ${classId}`
                });
              }
            });
            classesFromAssignments = Array.from(uniqueClasses.values());

            allowedClassIds = Array.from(new Set([
              ...classIdsFromMyClasses,
              ...assignedClassIds,
              ...teachingAssignmentClassIds,
              ...classTeacherIds
            ]));
          } else {
            allowedClassIds = classIdsFromMyClasses;
          }

          setTeacherClassIds(allowedClassIds);
          } catch (teacherError) {
            console.error('Error fetching teacher assignments:', teacherError);
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
      
      const [classesData, studentsData, examsData, subjectsData, availableTermsData] = await Promise.all([
        api.classes.list(),
        api.students.list(),
        api.exams.list(),
        api.subjects.list(),
        api.results.academicTerms.availableTerms(), // Fetch available academic terms
      ]);
      
      let allClasses = classesData.results || classesData;
      
      // Filter classes for teachers
      if (userRole === 'teacher') {
        // If we have classesFromAssignments (subject teacher with assignments), use those directly
        if (classesFromAssignments.length > 0) {
          allClasses = classesFromAssignments;
          const derivedClassIds = allClasses.map((c: any) => c.id).filter(Boolean);
          if (derivedClassIds.length > 0) {
            setTeacherClassIds(derivedClassIds);
          }
        } else if (allowedClassIds.length > 0) {
          // Otherwise, filter from API class list
          const allowedClassIdSet = new Set(allowedClassIds.map((id) => parseInt(String(id), 10)).filter((id) => !Number.isNaN(id)));
          allClasses = allClasses.filter((c: any) => allowedClassIdSet.has(parseInt(String(c.id), 10)));
        } else {
          allClasses = [];
        }
      }
      
      setClasses(allClasses);
      setAllStudents(studentsData.results || studentsData);
      setStudents(studentsData.results || studentsData);
      setExams(examsData.results || examsData);
      setSubjects(subjectsData.results || subjectsData);

      // Debug: log the available terms data
      console.log('Raw API response:', availableTermsData);
      const processedTerms = availableTermsData.results || availableTermsData;
      console.log('Processed available terms:', processedTerms);
      console.log('Extracted years:', processedTerms?.map((t: any) => t.academic_year));
      console.log('Extracted terms:', processedTerms?.map((t: any) => t.term));
      setAvailableTerms(processedTerms);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTermReports = async () => {
    try {
      const data = await api.results.termReports.list({
        academic_year: year,
        term: term
      });
      setTermReports(data.results || data);
    } catch (error) {
      console.error('Failed to fetch term reports:', error);
    }
  };

  const handleCreateOrSelectTermReport = async () => {
    if (!selectedReportClass || !term || !year) {
      alert('Please select class, term, and year');
      return;
    }

    try {
      setReportLoading(true);
      
      // Try to find existing term report for this class, year, and term
      const termReportsData = await api.results.termReports.list({
        academic_year: year,
        term: term,
        class_obj: selectedReportClass
      });
      const existingReports = termReportsData.results || termReportsData;
      
      let termReport;
      if (existingReports.length > 0) {
        // Use existing report
        termReport = existingReports[0];
        console.log('Using existing term report:', termReport);
      } else {
        // Create new term report
        termReport = await api.results.termReports.createReport({
          class_id: parseInt(selectedReportClass),
          academic_year: year,
          term: parseInt(term)
        });
        console.log('Created new term report:', termReport);
      }

      // Fetch students for the selected class from the API
      const studentsData = await api.students.list({
        current_class: parseInt(selectedReportClass)
      });
      const fetchedStudents = studentsData.results || studentsData;

      if (fetchedStudents.length === 0) {
        alert('No students found in this class');
        setReportLoading(false);
        return;
      }

      // Fetch existing entries if the report already exists
      const existingEntriesData = await api.results.termReportEntries.list({
        term_report: termReport.id
      });
      const existingEntries = existingEntriesData.results || existingEntriesData;

      console.log('Existing entries from database:', existingEntries);

      // Create a map of subject scores from existing entries for quick lookup
      const existingScoresMap = new Map();
      existingEntries.forEach((entry: any) => {
        // Handle both 'student' and 'student_id' field names
        const studentId = entry.student_id || entry.student;
        const subjectId = entry.subject_id || entry.subject;
        const key = `${studentId}-${subjectId}`;
        
        // Store all the detailed components
        const scoreData = {
          groupExercise: entry.group_exercise ? parseFloat(entry.group_exercise) : 0,
          cat3: entry.cat3 ? parseFloat(entry.cat3) : 0,
          exam: entry.exam ? parseFloat(entry.exam) : 0
        };
        
        existingScoresMap.set(key, scoreData);
        console.log(`Mapped existing score - Student: ${studentId}, Subject: ${subjectId}, Data:`, scoreData);
      });

      // Build students with existing scores
      const studentsWithScores = fetchedStudents.map((student: any) => ({
        id: student.id,
        name: student.full_name || `${student.first_name} ${student.last_name}`,
        className: typeof student.current_class === 'object' ? student.current_class?.name : student.current_class,
        rollNumber: student.student_id,
        classId: student.current_class?.id || selectedReportClass,
        scores: subjects.reduce((acc: any, subject: any) => {
          // Use existing score if available, otherwise create empty detailed structure
          const key = `${student.id}-${subject.id}`;
          const existingScore = existingScoresMap.get(key);
          
          if (existingScore) {
            // Populate with all existing components
            acc[subject.id] = {
              groupExercise: existingScore.groupExercise,
              cat3: existingScore.cat3,
              totalCAT: existingScore.groupExercise + existingScore.cat3,
              exam: existingScore.exam,
              finalTotal: existingScore.groupExercise + existingScore.cat3 + existingScore.exam
            };
            console.log(`Loaded existing marks for Student ${student.id}, Subject ${subject.id}:`, acc[subject.id]);
          } else {
            // No existing score, create empty structure
            acc[subject.id] = {
              groupExercise: 0,
              cat3: 0,
              totalCAT: 0,
              exam: 0,
              finalTotal: 0
            };
          }
          
          return acc;
        }, {})
      }));

      console.log('Students with loaded scores:', studentsWithScores);

      setClassStudents(studentsWithScores);
      setStudentsWithTotals(calculateTotals(studentsWithScores));
      setSelectedTermReport(termReport);
    } catch (error) {
      console.error('Failed to create/select term report:', error);
      alert('Failed to create or select term report');
    } finally {
      setReportLoading(false);
    }
  };

  const calculateTotals = (studentsData: any[]) => {
    const updatedStudents = studentsData.map(student => {
      // Calculate totals for each subject and grand total
      const updatedScores = { ...student.scores };
      Object.keys(updatedScores).forEach(subjectId => {
        const score = updatedScores[subjectId];
        if (typeof score === 'object') {
          const groupEx = parseFloat(score.groupExercise) || 0;
          const cat = parseFloat(score.cat3) || 0;
          const exam = parseFloat(score.exam) || 0;
          
          updatedScores[subjectId] = {
            ...score,
            groupExercise: groupEx,
            cat3: cat,
            totalCAT: groupEx + cat,
            exam: exam,
            finalTotal: groupEx + cat + exam
          };
        }
      });
      
      const total = Object.values(updatedScores).reduce((sum: number, score: any) => {
        if (typeof score === 'object') {
          return sum + (score.finalTotal || 0);
        }
        return sum + (score || 0);
      }, 0);
      
      return { ...student, scores: updatedScores, total };
    });

    // Calculate positions based on total scores
    const sortedStudents = [...updatedStudents].sort((a, b) => b.total - a.total);
    const studentsWithPosition = updatedStudents.map(student => {
      const position = sortedStudents.findIndex(s => s.id === student.id) + 1;
      return { ...student, position };
    });

    return studentsWithPosition;
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent('');
    if (classId) {
      const classIdNum = parseInt(classId);
      const filteredStudents = allStudents.filter((s: any) => {
        // Handle multiple cases: current_class as number, as object with id, or null
        if (!s.current_class) return false;

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

  const handleGenerateReport = async () => {
    if (!selectedStudent || !term || !year) {
      alert('Please select a student, term, and year');
      return;
    }

    try {
      setReportLoading(true);
      
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
      const studentEntries = entriesData.results || entriesData;
      
      if (studentEntries.length === 0) {
        alert('No marks found for this student in this term');
        setReportLoading(false);
        return;
      }
      
      // Build report card from entries
      const selectedStudentData = students.find((s: any) => s.id === parseInt(selectedStudent));
      
      // Calculate average marks - ensure proper type conversion
      const totalMarks = studentEntries.reduce((sum: number, entry: any) => {
        const marks = parseFloat(entry.marks_obtained) || 0;
        return sum + marks;
      }, 0);
      const averageMarks = studentEntries.length > 0 ? Math.round(totalMarks / studentEntries.length) : 0;
      
      console.log('Student Entries:', studentEntries);
      console.log('Total Marks:', totalMarks);
      console.log('Average Marks:', averageMarks);
      
      // Determine grade based on average
      let grade = 'F';
      if (averageMarks >= 90) grade = 'A';
      else if (averageMarks >= 80) grade = 'B';
      else if (averageMarks >= 70) grade = 'C';
      else if (averageMarks >= 60) grade = 'D';
      else if (averageMarks >= 50) grade = 'E';
      
      const reportCard = {
        id: selectedStudent,
        student: selectedStudent,
        student_name: selectedStudentData?.full_name || `${selectedStudentData?.first_name} ${selectedStudentData?.last_name}`,
        student_id: selectedStudentData?.student_id,
        class_name: typeof selectedStudentData?.current_class === 'object' ? selectedStudentData?.current_class?.name : selectedStudentData?.current_class,
        academic_year: year,
        term: term,
        marks_obtained: Number(averageMarks),
        total_marks: 100,
        percentage: Number(averageMarks),
        grade: grade,
        position: 1, // Placeholder
        results: studentEntries.map((entry: any) => ({
          ...entry,
          marks_obtained: parseFloat(entry.marks_obtained) || 0
        }))
      };
      
      setReportCard(reportCard);
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
        acc[subject.id] = {
          groupExercise: 0,
          cat3: 0,
          totalCAT: 0,
          exam: 0,
          finalTotal: 0
        };
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

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    alert('PDF download feature coming soon');
  };

  // Update score when input changes
  const updateScore = (studentId: any, subjectId: any, field: string, value: any) => {
    setStudentsWithTotals(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id === studentId) {
          const currentScore = student.scores[subjectId] || {
            groupExercise: 0,
            cat3: 0,
            totalCAT: 0,
            exam: 0,
            finalTotal: 0
          };
          const newScores = {
            ...student.scores,
            [subjectId]: {
              ...currentScore,
              [field]: parseFloat(value) || 0
            }
          };
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
      // Save all detailed components: group_exercise, cat3, exam
      const entries = studentsWithTotals.flatMap(student =>
        Object.keys(student.scores).map(subjectId => {
          const score = student.scores[subjectId];
          
          const groupExercise = typeof score === 'object' ? (parseFloat(score.groupExercise) || 0) : 0;
          const cat3 = typeof score === 'object' ? (parseFloat(score.cat3) || 0) : 0;
          const exam = typeof score === 'object' ? (parseFloat(score.exam) || 0) : 0;
          
          return {
            student_id: student.id,
            subject_id: parseInt(subjectId),
            group_exercise: groupExercise,
            cat3: cat3,
            exam: exam
          };
        })
      );

      console.log('Saving marks - Term Report ID:', selectedTermReport.id);
      console.log('Total entries to save:', entries.length);
      console.log('Students with scores:', studentsWithTotals.map(s => ({ id: s.id, name: s.name })));
      console.log('All entries to save:', entries);
      console.log('Sample entry:', entries[0]);

      const response = await api.results.termReportEntries.bulkCreate({
        term_report_id: selectedTermReport.id,
        entries: entries
      });

      console.log('Save response:', response);
      alert(`Marks saved successfully! Saved ${entries.length} entries.`);
      setShowTermlyReport(false);
      setStudentsWithTotals([]);
      setSelectedTermReport(null);
      setTermReportMode('');
      setSelectedSubject('');
    } catch (error: any) {
      console.error('Failed to save marks:', error);
      alert(`Failed to save marks: ${error.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const handleClearAllResults = async () => {
    if (!confirm('Are you sure you want to delete ALL term report entries? This cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      await api.results.termReportEntries.deleteAll();
      alert('All term report entries have been cleared successfully!');
      // Refresh the page
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to clear results:', error);
      alert(`Failed to clear results: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleArrowKeyNavigation = (e: React.KeyboardEvent<HTMLInputElement>, studentId: any, fieldName: string) => {
    // Only handle arrow keys
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }

    const inputElement = e.currentTarget;
    const table = inputElement.closest('table');
    if (!table) return;

    const inputs = Array.from(table.querySelectorAll('input[type="number"]'));
    const currentIndex = inputs.indexOf(inputElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = currentIndex + 3; // Assuming 3 input fields per row (GroupExercise, CAT3, Exam)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = currentIndex - 3;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = currentIndex + 1;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = currentIndex - 1;
    }

    if (nextIndex >= 0 && nextIndex < inputs.length) {
      (inputs[nextIndex] as HTMLInputElement).focus();
      (inputs[nextIndex] as HTMLInputElement).select();
    }
  };

  const createDetailedColumns = () => {
    if (!selectedSubject) {
      return [
        { key: 'name', header: 'Student Name' },
        { key: 'className', header: 'Class' }
      ];
    }

    return [
      { key: 'name', header: 'Student Name' },
      {
        key: 'groupExercise',
        header: 'Group Exercise (20)',
        render: (student: any) => (
          <input
            type="number"
            min="0"
            max="20"
            step="1"
            className="input-field w-20"
            value={student.scores[selectedSubject]?.groupExercise || ''}
            onChange={(e) => updateScore(student.id, selectedSubject, 'groupExercise', e.target.value)}
            onKeyDown={(e) => handleArrowKeyNavigation(e, student.id, 'groupExercise')}
          />
        )
      } as any,
      {
        key: 'cat3',
        header: 'CAT 3 (30)',
        render: (student: any) => (
          <input
            type="number"
            min="0"
            max="30"
            step="1"
            className="input-field w-20"
            value={student.scores[selectedSubject]?.cat3 || ''}
            onChange={(e) => updateScore(student.id, selectedSubject, 'cat3', e.target.value)}
            onKeyDown={(e) => handleArrowKeyNavigation(e, student.id, 'cat3')}
          />
        )
      } as any,
      {
        key: 'totalCAT',
        header: 'Total CAT (50)',
        render: (student: any) => (
          <span className="font-semibold">{student.scores[selectedSubject]?.totalCAT || 0}</span>
        )
      } as any,
      {
        key: 'exam',
        header: 'Exam (50)',
        render: (student: any) => (
          <input
            type="number"
            min="0"
            max="50"
            step="1"
            className="input-field w-20"
            value={student.scores[selectedSubject]?.exam || ''}
            onChange={(e) => updateScore(student.id, selectedSubject, 'exam', e.target.value)}
            onKeyDown={(e) => handleArrowKeyNavigation(e, student.id, 'exam')}
          />
        )
      } as any,
      {
        key: 'finalTotal',
        header: 'Total (100)',
        render: (student: any) => (
          <span className="font-bold text-primary-600">{student.scores[selectedSubject]?.finalTotal || 0}</span>
        )
      } as any
    ];
  };

  const createTotalsColumns = () => {
    const columns = [
      { key: 'name', header: 'Student Name' }
    ];

    // Add a column for each subject showing only final total
    subjects.forEach(subject => {
      columns.push({
        key: `subject_${subject.id}`,
        header: subject.name,
        render: (student: any) => {
          const score = student.scores[subject.id];
          const total = typeof score === 'object' ? score.finalTotal : (score || 0);
          return <span className="font-semibold">{total}</span>;
        }
      } as any);
    });

    // Add grand total column
    columns.push({
      key: 'total',
      header: 'Grand Total',
      render: (student: any) => (
        <span className="font-bold text-lg text-primary-600">{student.total || 0}</span>
      )
    } as any);

    return columns;
  };

  const selectedReportClassId = selectedReportClass ? parseInt(selectedReportClass, 10) : null;
  const allowedSubjectIdsForSelectedClass = (() => {
    if (userRole !== 'teacher' || !selectedReportClassId) return null;

    if (isTeacherClassTeacher && teacherClassTeacherIds.includes(selectedReportClassId)) {
      return null; // class teacher for this class can access all subjects
    }

    const assignments = teachingAssignments?.teaching_assignments || [];
    if (assignments.length > 0) {
      const subjectIds = assignments
        .filter((assignment: any) => {
          const classId = assignment.class_id || assignment.class_obj?.id || assignment.class?.id || assignment.class_obj || assignment.class;
          return parseInt(classId, 10) === selectedReportClassId;
        })
        .map((assignment: any) => assignment.subject_id || assignment.subject?.id || assignment.subject)
        .filter(Boolean);

      return subjectIds;
    }

    return teacherSubjectIds.length > 0 ? teacherSubjectIds : [];
  })();

  const filteredSubjectsForSelectedClass = allowedSubjectIdsForSelectedClass
    ? subjects.filter(subject => allowedSubjectIdsForSelectedClass.includes(subject.id))
    : subjects;

  return (
    <div className="p-8">
      {/* Enter Student Marks Section */}
      <>
        {/* Filters for Mark Entry */}
        <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Class & Term</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Class</label>
                <select
                  className="input-field"
                  value={selectedReportClass}
                  onChange={(e) => {
                    setSelectedReportClass(e.target.value);
                    setSelectedSubject('');
                  }}
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
                  onClick={handleCreateOrSelectTermReport}
                  disabled={reportLoading || !selectedReportClass || !term || !year}
                  className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors bg-[#ffe600] text-gray-900 hover:bg-[#f5dc00] w-full justify-center"
                >
                  <FiPlus className="w-4 h-4" />
                  {reportLoading ? 'Loading...' : 'Enter Results'}
                </button>
              </div>
            </div>
          </div>
          {selectedTermReport && (
            <div className="card p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Enter Marks - {studentsWithTotals.length} students
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('entry')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'entry'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Marks Entry
                  </button>
                  <button
                    onClick={() => setViewMode('totals')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'totals'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    View Totals
                  </button>
                  <button
                    onClick={handleSaveMarks}
                    disabled={reportLoading || studentsWithTotals.length === 0}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    {reportLoading ? 'Saving...' : 'Save Marks'}
                  </button>
                </div>
              </div>

              {viewMode === 'entry' && (
                <div className="mb-4">
                  <label className="label">Select Subject to Enter Marks</label>
                  {userRole === 'teacher' && !isTeacherClassTeacher && selectedReportClassId ? (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> As a subject teacher, you can only enter marks for your assigned subjects in this class: <strong>{filteredSubjectsForSelectedClass.map(s => s.name).join(', ') || 'None assigned'}</strong>
                      </p>
                    </div>
                  ) : null}
                  <select
                    className="input-field w-full max-w-md"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Select a subject...</option>
                    {filteredSubjectsForSelectedClass.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                  {!selectedSubject && (
                    <p className="text-sm text-gray-500 mt-2">
                      Please select a subject to start entering marks
                    </p>
                  )}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : studentsWithTotals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found in this class
                </div>
              ) : viewMode === 'entry' ? (
                selectedSubject ? (
                  <div className="overflow-x-auto">
                    <h4 className="text-md font-semibold mb-3 text-primary-600">
                      {subjects.find(s => s.id === parseInt(selectedSubject))?.name}
                    </h4>
                    <DataTable columns={createDetailedColumns()} data={studentsWithTotals} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a subject above to enter marks
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <h4 className="text-md font-semibold mb-3 text-primary-600">
                    All Subjects - Totals Overview
                  </h4>
                  <DataTable columns={createTotalsColumns()} data={studentsWithTotals} />
                </div>
              )}
            </div>
          )}
        </>
      
    </div>
  );
}

