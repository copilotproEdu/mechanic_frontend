'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiUser, FiCalendar, FiPrinter, FiDownload, FiSearch, FiPlus } from 'react-icons/fi';
import { api } from '@/lib/api';
import ExamForm from '@/components/ExamForm';
import MarksEntryForm from '@/components/MarksEntryForm';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ManagerResultsPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [term, setTerm] = useState('1');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [reportCard, setReportCard] = useState<any>(null);
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [isMarksEntryOpen, setIsMarksEntryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [classesRes, studentsRes, examsRes] = await Promise.all([
        api.classes.list(),
        api.students.list(),
        api.results.exams.list(),
      ]);
      setClasses(classesRes.results || classesRes);
      setAllStudents(studentsRes.results || studentsRes);
      setStudents(studentsRes.results || studentsRes);
      setExams(examsRes.results || examsRes);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent('');
    if (classId) {
      const filteredStudents = allStudents.filter((s: any) => s.current_class === parseInt(classId));
      setStudents(filteredStudents);
    } else {
      setStudents(allStudents);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedStudent || !term || !year) {
      alert('Please select all filters');
      return;
    }

    try {
      setLoading(true);
      const reportData = await api.results.reportCards.list({
        student: selectedStudent,
        academic_year: year,
        term: term,
      });

      if (reportData.results?.[0]) {
        setReportCard(reportData.results[0]);
      } else if (reportData[0]) {
        setReportCard(reportData[0]);
      } else {
        alert('No report card found for this student');
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    const reportElement = document.getElementById('report-card');
    if (!reportElement) {
      alert('Report card not found');
      return;
    }

    const printWindow = window.open('', '', 'width=900,height=900');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report');
      return;
    }

    const reportHTML = reportElement.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report Card - Print</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm 12mm; 
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print { display: none !important; }
              button { display: none !important; }
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: white;
              color: #333;
              font-size: 9pt;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-height: 100vh;
              padding: 20px;
            }
            .card {
              background: white;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 30px 0;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 28px 8px;
              text-align: left;
              font-size: 13pt;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              font-size: 13pt;
              padding: 32px 8px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .text-xs { font-size: 10pt; }
            .text-sm { font-size: 11pt; }
            .text-lg { font-size: 13pt; }
            .text-xl { font-size: 14pt; }
            .text-2xl { font-size: 18pt; }
            .text-3xl { font-size: 18pt; }
            .mb-2 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1.25rem; }
            .mb-6 { margin-bottom: 2rem; }
            .mb-8 { margin-bottom: 2.5rem; }
            .mb-12 { margin-bottom: 3rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-4 { margin-top: 0.875rem; }
            .mt-6 { margin-top: 1.25rem; }
            .p-4 { padding: 0.875rem; }
            .py-3 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-4 { padding-top: 0.875rem; padding-bottom: 0.875rem; }
            .px-4 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .pb-6 { padding-bottom: 1.25rem; }
            .pt-6 { padding-top: 1.25rem; }
            .border-t { border-top: 1px solid #d1d5db; }
            .border-b { border-bottom: 1px solid #d1d5db; }
            .border-b-2 { border-bottom: 2px solid #d1d5db; }
            .border-t-2 { border-top: 2px solid #d1d5db; }
            .border { border: 1px solid #e5e7eb; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            .rounded-lg { border-radius: 0.25rem; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .gap-4 { gap: 0.75rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .whitespace-nowrap { white-space: nowrap; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.025em; }
            .overflow-x-auto { overflow-x: auto; }
            .w-full { width: 100%; }
            .w-16 { width: 3.5rem; }
            .h-16 { height: 3.5rem; }
            .object-contain { object-fit: contain; }
            .hover\\:bg-gray-50:hover { background-color: #f9fafb; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-900 { color: #111827; }
            .text-blue-600 { color: #2563eb; }
            .text-blue-700 { color: #1d4ed8; }
            .text-green-600 { color: #16a34a; }
            .text-yellow-600 { color: #ca8a04; }
            .text-orange-600 { color: #ea580c; }
            .text-primary-600 { color: #dc2626; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${reportHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadReport = async () => {
    try {
      const reportElement = document.getElementById('report-card');
      if (!reportElement) {
        alert('Report card not found');
        return;
      }

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const studentName = reportCard?.student_obj?.full_name || 
                         `${reportCard?.student_obj?.first_name} ${reportCard?.student_obj?.last_name}` || 
                         'Report';
      pdf.save(`${studentName}_Report_${reportCard?.academic_year}_Term${reportCard?.term}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="p-8">
      {/* Filters */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Generate Report Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              disabled={!selectedClass}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.full_name || `${student.first_name} ${student.last_name}`}
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
              <option value="1">First Term</option>
              <option value="2">Second Term</option>
              <option value="3">Third Term</option>
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select
              className="input-field"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              <FiSearch className="w-4 h-4" />
              {loading ? 'Loading...' : 'View Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setIsExamFormOpen(true)}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg font-medium"
        >
          <FiPlus className="w-4 h-4" />
          Create Termly Report
        </button>
        <button
          onClick={() => setIsMarksEntryOpen(true)}
          className="flex items-center gap-2 bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-2 rounded-lg font-medium"
        >
          <FiPlus className="w-4 h-4" />
          Enter Student Marks
        </button>
      </div>

      {/* Student Report Card */}
      {reportCard && (
        <div className="card p-6 mb-6" id="report-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 whitespace-nowrap">EMMILIT PREPARATORY SCHOOL</h2>
              <p className="text-sm text-gray-600">P.O. Box 123, Accra, Ghana</p>
              <p className="text-sm text-gray-600">Tel: +233 123 4567 | Email: info@emmilit.edu.gh</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-900">REPORT CARD</h3>
              <p className="text-sm text-gray-600">Academic Year: {reportCard.academic_year}</p>
              <p className="text-sm text-gray-600">Term: {reportCard.term}</p>
            </div>
          </div>

          <div className="border-t border-b border-gray-300 py-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Student Name</p>
                <p className="text-2xl font-bold text-gray-900">{reportCard.student_obj?.full_name || `${reportCard.student_obj?.first_name} ${reportCard.student_obj?.last_name}` || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Class</p>
                <p className="text-2xl font-bold text-gray-900">{reportCard.class_obj?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Position in Class</p>
                <p className="text-2xl font-bold text-gray-900">#{reportCard.position || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="card p-4">
              <h4 className="font-semibold mb-2">Academic Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Percentage:</span>
                  <span className="font-semibold">{reportCard.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grade:</span>
                  <span className="font-semibold">{reportCard.grade || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold mb-2">Academic Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Marks:</span>
                  <span className="font-semibold">{reportCard.marks_obtained}/{reportCard.total_marks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Percentage:</span>
                  <span className="font-semibold">{reportCard.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Grade:</span>
                  <span className="font-semibold">{reportCard.grade}</span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold mb-2">Attendance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Days:</span>
                  <span className="font-semibold">{reportCard.total_days}</span>
                </div>
                <div className="flex justify-between">
                  <span>Present:</span>
                  <span className="font-semibold">{reportCard.days_present}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attendance %:</span>
                  <span className="font-semibold">{reportCard.attendance_percentage}%</span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h4 className="font-semibold mb-2">Remarks</h4>
              <p className="text-sm">{reportCard.teacher_remarks || 'No remarks'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Print/Download Buttons - Outside report card */}
      {reportCard && (
        <div className="flex gap-3 mb-6 no-print">
          <button onClick={handlePrintReport} className="btn-secondary flex items-center gap-2">
            <FiPrinter className="w-4 h-4" />
            Print
          </button>
          <button onClick={handleDownloadReport} className="btn-secondary flex items-center gap-2">
            <FiDownload className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )}

      {/* Modals */}
      <ExamForm
        isOpen={isExamFormOpen}
        onClose={() => setIsExamFormOpen(false)}
        onSuccess={() => {
          fetchInitialData();
          setIsExamFormOpen(false);
        }}
      />
      <MarksEntryForm
        isOpen={isMarksEntryOpen}
        onClose={() => setIsMarksEntryOpen(false)}
        onSuccess={() => {
          fetchInitialData();
          setIsMarksEntryOpen(false);
        }}
      />
    </div>
  );
}
