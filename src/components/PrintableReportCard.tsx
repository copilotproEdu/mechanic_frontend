'use client';

interface Subject {
  name: string;
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remarks?: string;
}

interface PrintableReportCardProps {
  studentName: string;
  studentId: number;
  className: string;
  term: number;
  academicYear: string;
  position: number | string;
  attendance: string;
  subjects: Subject[];
  rollNo: number;
  overallGrade: string;
  overallPercentage: number;
  classTeacher: string;
  teacherRemarks?: string;
}

export default function PrintableReportCard({
  studentName,
  className,
  term,
  academicYear,
  position,
  attendance,
  subjects,
  rollNo,
  overallGrade,
  overallPercentage,
  classTeacher,
  teacherRemarks = '0'
}: PrintableReportCardProps) {
  
  const totalClassScore = subjects.reduce((sum, s) => sum + (s.classScore || 0), 0);
  const totalExamScore = subjects.reduce((sum, s) => sum + (s.examScore || 0), 0);
  const maxPossible = subjects.length * 100;

  return (
    <div className="printable-report-card" style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      padding: '15mm',
      margin: '0 auto',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      color: '#000',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div className="report-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <div className="report-logo" style={{ width: '100px', marginRight: '20px' }}>
          <img src="/images/logo.png" alt="School Logo" style={{ width: '100%' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 'bold' }}>Emmilit Preparatory School</h1>
          <p style={{ margin: '5px 0', fontSize: '10pt' }}>P.O.BOX AT 571, Achimota</p>
          <p style={{ margin: '5px 0', fontSize: '10pt' }}>
            <strong>Phone:</strong> 0204663997 &nbsp;&nbsp; <strong>Email:</strong> royalemmilit@gmail.com
          </p>
        </div>
      </div>

      {/* Term and Year */}
      <div style={{ textAlign: 'center', marginBottom: '15px', backgroundColor: '#f0f0f0', padding: '8px', border: '1px solid #000' }}>
        <h2 style={{ margin: 0, fontSize: '12pt' }}>Term {term}</h2>
        <p style={{ margin: 0, fontSize: '11pt' }}>{academicYear} Academic Year</p>
      </div>

      {/* Student Info Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px', border: '1px solid #000', padding: '8px' }}>
        <div>
          <strong>Position:</strong> <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '60px', textAlign: 'center' }}>{position}</span>
        </div>
        <div>
          <strong>Class:</strong> <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '80px', textAlign: 'center' }}>{className}</span>
        </div>
        <div>
          <strong>Attendance:</strong> <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '80px', textAlign: 'center' }}>{attendance}</span>
        </div>
      </div>

      {/* Student Name */}
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <strong>Student Name:</strong> <span className="report-student-name" style={{ borderBottom: '2px solid #000', display: 'inline-block', minWidth: '300px', fontSize: '14pt', fontWeight: 'bold', textAlign: 'center' }}>{studentName}</span>
      </div>

      {/* Marks Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '2px solid #000' }}>
        <thead>
          <tr style={{ backgroundColor: '#d3d3d3' }}>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '30px' }}></th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Subject</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Class Score<br/>(50%)</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Exam Score<br/>(50%)</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Total Score<br/>(100%)</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Subject<br/>Grade</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 9 }, (_, i) => {
            const subject = subjects[i];
            return (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{subject?.name || ''}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{subject?.classScore || 0}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{subject?.examScore || 0}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{subject?.totalScore || 0}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{subject?.grade || 'F'}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{subject?.remarks || ''}</td>
              </tr>
            );
          })}
          <tr style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Total</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{totalClassScore}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{totalExamScore}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
        </tbody>
      </table>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '15px', border: '1px solid #000', padding: '10px' }}>
        <div>
          <strong>Roll No:</strong> <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '60px', textAlign: 'center', marginLeft: '10px' }}>{rollNo}</span>
        </div>
        <div>
          <strong>Grade:</strong> <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '60px', textAlign: 'center', marginLeft: '10px' }}>{overallGrade}</span>
        </div>
        <div>
          <strong>Overall Percentage:</strong> <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '80px', textAlign: 'center', marginLeft: '10px' }}>{overallPercentage.toFixed(2)}</span>
        </div>
      </div>

      {/* Grading System */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '2px solid #000' }}>
        <thead>
          <tr style={{ backgroundColor: '#d3d3d3' }}>
            <th colSpan={8} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Grading System</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>100 - 91</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>90 - 81</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>80 - 71</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>70 - 61</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>60 - 51</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>50 - 35</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>34 - 0</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Pupil Id</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>A+</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>A</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>B</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>C</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>D</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>E</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Fail</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>12</td>
          </tr>
        </tbody>
      </table>

      {/* Teacher's Remarks */}
      <div style={{ marginBottom: '15px', border: '1px solid #000', padding: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Class Teacher&apos;s Remarks</div>
        <div style={{ minHeight: '40px', borderBottom: '1px solid #ccc', padding: '5px' }}>{teacherRemarks}</div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '15px' }}>
        <div style={{ border: '1px solid #000', padding: '30px 10px 10px 10px', textAlign: 'center', position: 'relative', minHeight: '80px' }}>
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', textAlign: 'center' }}>
            <div>{classTeacher || 'Leticia Baidoo'}</div>
            <div style={{ fontSize: '9pt', color: '#666' }}>Class Teacher</div>
          </div>
        </div>
        <div style={{ border: '1px solid #000', padding: '30px 10px 10px 10px', textAlign: 'center', position: 'relative', minHeight: '80px' }}>
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', textAlign: 'center' }}>
            <div>Ruth Akuffo</div>
            <div style={{ fontSize: '9pt', color: '#666' }}>Headmistress</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '9pt', fontStyle: 'italic', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p style={{ margin: '5px 0' }}>In the hallowed halls of Emmilit School</p>
        <p style={{ margin: '5px 0' }}>this report symbolizes our commitment to excellence.</p>
        <p style={{ margin: '5px 0' }}>Beyond grades, it reflects a journey of resilience, growth, and triumph for every student.</p>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Executive Director</p>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media screen and (max-width: 768px) {
          .printable-report-card {
            width: 100% !important;
            min-height: auto !important;
            padding: 8px !important;
            font-size: 9pt !important;
            margin: 0 !important;
          }

          .report-header {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }

          .report-logo {
            width: 70px !important;
            margin-right: 0 !important;
          }

          .printable-report-card h1 {
            font-size: 16pt !important;
          }

          .report-student-name {
            min-width: 0 !important;
            width: 100% !important;
            font-size: 12pt !important;
          }

          .printable-report-card table th,
          .printable-report-card table td {
            padding: 4px !important;
            font-size: 9pt !important;
          }
        }

        @media print {
          .printable-report-card {
            margin: 0;
            padding: 15mm;
            width: 210mm;
            min-height: 297mm;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
