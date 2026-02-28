'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { api } from '@/lib/api';

interface MarksEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examId?: string;
}

export const MarksEntryForm: React.FC<MarksEntryFormProps> = ({ isOpen, onClose, onSuccess, examId }) => {
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState(examId || '');
  const [selectedClass, setSelectedClass] = useState('');
  const [marks, setMarks] = useState<Record<string, { student_id: string; marks: string; remarks: string; is_absent: boolean }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchExams();
      fetchClasses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedExam) {
      fetchStudentsForExam();
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const res = await api.results.exams.list();
      setExams(res.results || res);
    } catch (err) {
      console.error('Failed to load exams:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.classes.list();
      setClasses(res.results || res);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const fetchStudentsForExam = async () => {
    try {
      const exam = exams.find(e => e.id === selectedExam);
      if (!exam) return;

      const res = await api.students.list({ class_id: exam.class_obj });
      const studentList = res.results || res;
      setStudents(studentList);
      setSelectedClass(exam.class_obj);

      // Initialize marks form
      const initialMarks: Record<string, any> = {};
      studentList.forEach((student: any) => {
        initialMarks[student.id] = {
          student_id: student.id,
          marks: '',
          remarks: '',
          is_absent: false,
        };
      });
      setMarks(initialMarks);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const handleMarkChange = (studentId: string, field: string, value: any) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedExam) {
      setError('Please select an exam');
      return;
    }

    try {
      setLoading(true);
      const exam = exams.find(e => e.id === selectedExam);
      const totalMarks = exam?.total_marks || 100;

      // Create results for each student
      const resultPromises = Object.values(marks).map(async (entry: any) => {
        if (!entry.marks && !entry.is_absent) return; // Skip if no marks and not marked absent

        try {
          await api.results.results.create({
            student: entry.student_id,
            exam: selectedExam,
            marks_obtained: entry.is_absent ? 0 : parseFloat(entry.marks),
            is_absent: entry.is_absent,
            remarks: entry.remarks,
            // Grade will be auto-calculated on backend
          });
        } catch (err) {
          console.error(`Failed to save marks for student ${entry.student_id}:`, err);
        }
      });

      await Promise.all(resultPromises);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save marks');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-semibold">Enter Student Marks</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}

          <div>
            <label className="label">Select Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Select Exam --</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} - {exam.subject?.name} ({exam.class_obj?.name})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && students.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead className="table-header bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Student Name</th>
                      <th className="px-4 py-2 text-left">Roll Number</th>
                      <th className="px-4 py-2 text-center">Absent</th>
                      <th className="px-4 py-2 text-center">Marks</th>
                      <th className="px-4 py-2 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{student.full_name || `${student.first_name} ${student.last_name}`}</td>
                        <td className="px-4 py-3">{student.student_id}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={marks[student.id]?.is_absent || false}
                            onChange={(e) =>
                              handleMarkChange(student.id, 'is_absent', e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={exams.find(e => e.id === selectedExam)?.total_marks || 100}
                            step="0.5"
                            value={marks[student.id]?.marks || ''}
                            onChange={(e) =>
                              handleMarkChange(student.id, 'marks', e.target.value)
                            }
                            className="input-field w-20 text-center"
                            placeholder="0"
                            disabled={marks[student.id]?.is_absent}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={marks[student.id]?.remarks || ''}
                            onChange={(e) =>
                              handleMarkChange(student.id, 'remarks', e.target.value)
                            }
                            className="input-field text-sm"
                            placeholder="Optional remarks"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : `Save Marks for ${students.length} Students`}
                </button>
              </div>
            </>
          )}

          {selectedExam && students.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No students found for this exam class.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MarksEntryForm;
