'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiBook } from 'react-icons/fi';
import { api } from '@/lib/api';
import { formatDateForInput, convertToISODate } from '@/lib/dateUtils';

interface ExamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExamForm: React.FC<ExamFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    exam_type: 'midterm',
    class_obj: '',
    subject: '',
    academic_year: new Date().getFullYear().toString(),
    term: '1',
    exam_date: new Date().toISOString().split('T')[0],
    total_marks: '100',
    passing_marks: '40',
    duration_minutes: '60',
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, subjectsRes] = await Promise.all([
        api.classes.list(),
        api.subjects.list(),
      ]);
      setClasses(classesRes.results || classesRes);
      setSubjects(subjectsRes.results || subjectsRes);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.results.exams.create({
        ...formData,
        total_marks: parseInt(formData.total_marks),
        passing_marks: parseInt(formData.passing_marks),
        duration_minutes: parseInt(formData.duration_minutes),
        term: parseInt(formData.term),
      });

      onSuccess();
      setFormData({
        name: '',
        exam_type: 'midterm',
        class_obj: '',
        subject: '',
        academic_year: new Date().getFullYear().toString(),
        term: '1',
        exam_date: new Date().toISOString().split('T')[0],
        total_marks: '100',
        passing_marks: '40',
        duration_minutes: '60',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create exam');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Create New Exam</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Exam Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Term 1 Mathematics Test"
                required
              />
            </div>
            <div>
              <label className="label">Exam Type</label>
              <select name="exam_type" value={formData.exam_type} onChange={handleChange} className="input-field">
                <option value="midterm">Mid Term</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
                <option value="practical">Practical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Class</label>
              <select
                name="class_obj"
                value={formData.class_obj}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subj => (
                  <option key={subj.id} value={subj.id}>{subj.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Academic Year</label>
              <input
                type="text"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="input-field"
                placeholder="2025-2026"
                required
              />
            </div>
            <div>
              <label className="label">Term</label>
              <select name="term" value={formData.term} onChange={handleChange} className="input-field">
                <option value="1">First Term</option>
                <option value="2">Second Term</option>
                <option value="3">Third Term</option>
              </select>
            </div>
            <div>
              <label className="label">Exam Date</label>
              <input
                type="date"
                name="exam_date"
                value={formatDateForInput(formData.exam_date)}
                onChange={(e) => {
                  const isoDate = convertToISODate(e.target.value);
                  setFormData({...formData, exam_date: isoDate});
                }}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Total Marks</label>
              <input
                type="number"
                name="total_marks"
                value={formData.total_marks}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Passing Marks</label>
              <input
                type="number"
                name="passing_marks"
                value={formData.passing_marks}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;
