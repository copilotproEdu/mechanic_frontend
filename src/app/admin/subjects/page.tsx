'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiBook, FiUser, FiCalendar, FiCheckCircle, FiPlus, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function SubjectsPage() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [subjectTeachers, setSubjectTeachers] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: ''
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [subjectsData, classesData, teachersData, classSubjectsData] = await Promise.all([
        api.subjects.list(),
        api.classes.list(),
        api.teachers.list(),
        api.subjects.classSubjects.list(),
      ]);
      setSubjects(subjectsData.results || subjectsData);
      setClasses(classesData.results || classesData);
      setTeachers(teachersData.results || teachersData);
      setClassSubjects(classSubjectsData.results || classSubjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSubject = (subjectId: string) => {
    const newSet = new Set(selectedSubjects);
    if (newSet.has(subjectId)) {
      newSet.delete(subjectId);
      const newTeachers = { ...subjectTeachers };
      delete newTeachers[subjectId];
      setSubjectTeachers(newTeachers);
    } else {
      newSet.add(subjectId);
    }
    setSelectedSubjects(newSet);
  };

  const handleAssignTeacher = (subjectId: string, teacherId: string) => {
    setSubjectTeachers(prev => ({
      ...prev,
      [subjectId]: teacherId
    }));
  };

  const handleSaveAssignments = async () => {
    if (!selectedClass || selectedSubjects.size === 0) {
      alert('Please select class and at least one subject');
      return;
    }

    try {
      setAssigning(true);
      const currentYear = new Date().getFullYear().toString();
      const assignments = Array.from(selectedSubjects).map(subjectId => ({
        class_obj: parseInt(selectedClass),
        subject: parseInt(subjectId),
        teacher: subjectTeachers[subjectId] ? parseInt(subjectTeachers[subjectId]) : null,
        academic_year: currentYear,
        term: 1
      }));

      // Save each assignment using bulk create
      await api.subjects.classSubjects.bulkCreate(assignments);

      alert('Subjects assigned successfully!');
      setShowAssignModal(false);
      setSelectedClass('');
      setSelectedSubjects(new Set());
      setSubjectTeachers({});
      
      // Refresh the class subjects list to show updated assignments
      const classSubjectsData = await api.subjects.classSubjects.list();
      setClassSubjects(classSubjectsData.results || classSubjectsData);
    } catch (error) {
      console.error('Failed to assign subjects:', error);
      alert('Failed to assign subjects');
    } finally {
      setAssigning(false);
    }
  };

  const generateSubjectCode = (name: string) => {
    // Extract first 3-4 letters and convert to uppercase
    const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const code = prefix || 'SUB';
    setGeneratedCode(code);
    return code;
  };

  const handleSubjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewSubject(prev => ({ ...prev, name }));
    if (name) {
      generateSubjectCode(name);
    } else {
      setGeneratedCode('');
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.name) {
      alert('Please fill in subject name');
      return;
    }

    try {
      setCreating(true);
      await api.subjects.create({
        name: newSubject.name,
        description: newSubject.description,
        status: 'active'
      });

      alert('Subject created successfully!');
      setShowCreateModal(false);
      setNewSubject({
        name: '',
        description: ''
      });
      setGeneratedCode('');
      fetchInitialData();
    } catch (error) {
      console.error('Failed to create subject:', error);
      alert('Failed to create subject');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Subject Name' },
    { key: 'code', header: 'Code' },
    { key: 'teacher_name', header: 'Teacher' },
    { key: 'credits', header: 'Credits' },
    {
      key: 'status',
      header: 'Status',
      render: (subject: any) => <StatusBadge status={subject.status || 'active'} />
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Subjects"
          value={subjects.length.toString()}
          icon={<FiBook className="w-6 h-6" />}
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Active Subjects"
          value={subjects.filter(s => s.status === 'active').length.toString()}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Credits"
          value={subjects.reduce((sum, s) => sum + (s.credits || 0), 0).toString()}
          icon={<FiBook className="w-6 h-6" />}
          color="purple"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Avg. Credits"
          value={(subjects.length > 0 ? subjects.reduce((sum, s) => sum + (s.credits || 0), 0) / subjects.length : 0).toFixed(1)}
          icon={<FiBook className="w-6 h-6" />}
          color="primary"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Subjects Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Subjects</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search subjects..."
              className="input-field w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Create Subject
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-2 rounded-lg font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Assign Subject
            </button>
          </div>
        </div>
        
        <DataTable columns={columns} data={filteredSubjects} />
      </div>

      {/* Class-Subject Assignments */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Class-Subject Assignments</h3>
        
        {classSubjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No subject assignments yet. Click &quot;Assign Subject&quot; to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-semibold">Class</th>
                  <th className="text-left p-3 font-semibold">Subject</th>
                  <th className="text-left p-3 font-semibold">Subject Code</th>
                  <th className="text-left p-3 font-semibold">Teacher Assigned</th>
                  <th className="text-left p-3 font-semibold">Term</th>
                  <th className="text-left p-3 font-semibold">Year</th>
                </tr>
              </thead>
              <tbody>
                {classSubjects.map((assignment: any) => (
                  <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{assignment.class_name}</td>
                    <td className="p-3">{assignment.subject_name}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">
                        {subjects.find(s => s.id === assignment.subject)?.code || '—'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-green-700">
                      {assignment.teacher_name || <span className="text-gray-400">Not assigned</span>}
                    </td>
                    <td className="p-3">Term {assignment.term}</td>
                    <td className="p-3">{assignment.academic_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Create New Subject</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Subject Name */}
              <div>
                <label className="label font-semibold mb-2">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics"
                  className="input-field w-full"
                  value={newSubject.name}
                  onChange={handleSubjectNameChange}
                />
              </div>

              {/* Auto-Generated Code Display */}
              <div>
                <label className="label font-semibold mb-2">Subject Code (Auto-Generated)</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-semibold">
                    {generatedCode || '—'}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">Auto-generated from name</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label font-semibold mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Subject description..."
                  className="input-field w-full h-24"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubject}
                  disabled={creating || !generatedCode}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  {creating ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Subject Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">Assign Subjects to Class</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Class Selection */}
              <div>
                <label className="label font-semibold mb-2">Select Class</label>
                <select
                  className="input-field w-full"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Choose a class...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selection and Teacher Assignment */}
              {selectedClass && (
                <div>
                  <label className="label font-semibold mb-4">Select Subjects and Assign Teachers</label>
                  <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {subjects.filter(s => s.status === 'active').map(subject => (
                      <div key={subject.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            id={`subject_${subject.id}`}
                            checked={selectedSubjects.has(subject.id.toString())}
                            onChange={() => handleToggleSubject(subject.id.toString())}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor={`subject_${subject.id}`} className="font-semibold cursor-pointer">
                              {subject.name}
                            </label>
                          </div>
                        </div>

                        {/* Teacher Assignment */}
                        {selectedSubjects.has(subject.id.toString()) && (
                          <div className="ml-7">
                            <label className="text-sm label">Assign Teacher</label>
                            <select
                              className="input-field w-full"
                              value={subjectTeachers[subject.id] || ''}
                              onChange={(e) => handleAssignTeacher(subject.id.toString(), e.target.value)}
                            >
                              <option value="">Select a teacher...</option>
                              {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                  {teacher.full_name || `${teacher.first_name} ${teacher.last_name}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Summary */}
              {selectedSubjects.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold mb-2">Summary: {selectedSubjects.size} subject(s) selected</p>
                  <ul className="text-sm text-gray-700">
                    {Array.from(selectedSubjects).map(subId => {
                      const subj = subjects.find(s => s.id.toString() === subId);
                      const teacherId = subjectTeachers[subId];
                      const teacher = teacherId ? teachers.find(t => t.id.toString() === teacherId) : null;
                      return (
                        <li key={subId} className="py-1">
                          <span className="font-medium">{subj?.name}</span> → {teacher ? teacher.full_name || `${teacher.first_name} ${teacher.last_name}` : '(No teacher assigned)'}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignments}
                  disabled={assigning || !selectedClass || selectedSubjects.size === 0}
                  className="flex items-center gap-2 bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  {assigning ? 'Saving...' : 'Save Assignments'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

