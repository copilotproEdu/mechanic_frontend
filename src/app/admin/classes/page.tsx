'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiBook, FiUsers, FiUser, FiCalendar, FiCheckCircle, FiPlus, FiX, FiArrowUp } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function ClassesPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [newClass, setNewClass] = useState({
    name: '',
    grade_level: '',
    capacity: 30,
    class_teacher: '',
    status: 'active'
  });
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [showStudentListModal, setShowStudentListModal] = useState(false);
  const [classStudents, setClassStudents] = useState<any[]>([]);

  const fillDummyClass = () => {
    const levels = ['creche', 'kindergarten', 'lower_primary', 'upper_primary'];
    const letters = ['A', 'B', 'C'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const capacity = 25 + Math.floor(Math.random() * 15);
    const gradeNumber = 1 + Math.floor(Math.random() * 12);
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const teacher = teachers[Math.floor(Math.random() * Math.max(teachers.length, 1))];

    setNewClass({
      name: `Grade ${gradeNumber}${letter}`,
      grade_level: level,
      capacity,
      class_teacher: teacher?.id || '',
      status: 'active'
    });
  };
  
  // Promotion states
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showCrechePromotionModal, setShowCrechePromotionModal] = useState(false);
  const [crecheStudents, setCrecheStudents] = useState<any[]>([]);
  const [selectedCrecheStudents, setSelectedCrecheStudents] = useState<Set<number>>(new Set());
  const [promotingStudents, setPromotingStudents] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const teachersData = await api.teachers.list();
      setTeachers(teachersData.results || teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const [classesData, statsData] = await Promise.all([
        api.classes.list(),
        api.classes.statistics()
      ]);

      setClasses(classesData.results || classesData);
      setClassStats(statsData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    try {
      const classData = {
        ...newClass,
        capacity: Number(newClass.capacity) || 30
      };

      let updatedClass: any;
      if (editingClassId) {
        // Update existing class
        updatedClass = await api.classes.update(editingClassId, classData);
        setClasses(prev => prev.map(c => c.id === editingClassId ? updatedClass : c));
      } else {
        // Create new class
        updatedClass = await api.classes.create(classData);
        setClasses(prev => [updatedClass, ...prev]);

        // Update stats to reflect the new class
        if (classStats) {
          setClassStats((prev: any) => ({
            ...prev,
            total_classes: prev.total_classes + 1,
            active_classes: newClass.status === 'active' ? prev.active_classes + 1 : prev.active_classes
          }));
        }
      }

      // Reset form and close modal
      setNewClass({
        name: '',
        grade_level: '',
        capacity: 30,
        class_teacher: '',
        status: 'active'
      });
      setEditingClassId(null);
      setShowAddClassModal(false);
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handlePromoteAllStudents = async () => {
    if (!window.confirm('Are you sure the year has ended and you want to promote all students to the next class? This action cannot be undone.')) {
      return;
    }

    try {
      setPromotingStudents(true);
      const response = await api.classes.promoteStudents();
      
      if (response.success) {
        alert(`Success! ${response.promoted_count} students have been promoted.`);
        setShowPromotionModal(false);
        // Refresh the classes data
        await fetchClasses();
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Error promoting students:', error);
      alert('Error promoting students. Please try again.');
    } finally {
      setPromotingStudents(false);
    }
  };

  const handleShowCrechePromotion = async () => {
    try {
      // Fetch all creche students
      const crecheData = await api.classes.crecheStudents();
      setCrecheStudents(crecheData);
      setSelectedCrecheStudents(new Set());
      setShowCrechePromotionModal(true);
    } catch (error) {
      console.error('Error fetching creche students:', error);
      alert('Error fetching creche students');
    }
  };

  const handlePromoteCrecheStudents = async () => {
    if (selectedCrecheStudents.size === 0) {
      alert('Please select at least one student to promote');
      return;
    }

    if (!window.confirm(`Are you sure you want to promote ${selectedCrecheStudents.size} student(s) from Creche to Kindergarten? This action cannot be undone.`)) {
      return;
    }

    try {
      setPromotingStudents(true);
      const response = await api.classes.promoteCreche(Array.from(selectedCrecheStudents));
      
      if (response.success) {
        alert(`Success! ${response.promoted_count} creche students have been promoted.`);
        setShowCrechePromotionModal(false);
        setCrecheStudents([]);
        setSelectedCrecheStudents(new Set());
        // Refresh the classes data
        await fetchClasses();
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Error promoting creche students:', error);
      alert('Error promoting creche students. Please try again.');
    } finally {
      setPromotingStudents(false);
    }
  };

  const toggleCrecheStudent = (studentId: number) => {
    const newSelected = new Set(selectedCrecheStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedCrecheStudents(newSelected);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Class Name' },
    { key: 'teacher_name', header: 'Teacher' },
    { key: 'student_count', header: 'Students' },
    {
      key: 'level',
      header: 'Level',
      render: (classInfo: any) => classInfo.grade_level || classInfo.class_level || 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      render: (classInfo: any) => <StatusBadge status={classInfo.status || 'active'} />
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Classes"
          value={classStats?.total_classes?.toString() || '0'}
          icon={<FiBook className="w-6 h-6" />}
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Active Classes"
          value={classStats?.active_classes?.toString() || '0'}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Students"
          value={classStats?.total_students?.toString() || '0'}
          icon={<FiUsers className="w-6 h-6" />}
          color="purple"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Avg. Class Size"
          value={classStats?.average_class_size?.toFixed(0) || '0'}
          icon={<FiUser className="w-6 h-6" />}
          color="primary"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Classes Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Classes</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search classes..."
              className="input-field w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowPromotionModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              title="Promote Pre school students to Kindergarten"
            >
              <FiArrowUp className="w-4 h-4" />
              <span>Promote Pre school Students</span>
            </button>
            <button
              onClick={() => {
                setEditingClassId(null); // Reset editing state when adding new class
                setNewClass({
                  name: '',
                  grade_level: '',
                  capacity: 30,
                  class_teacher: '',
                  status: 'active'
                }); // Reset form fields
                setShowAddClassModal(true);
              }}
              className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Class</span>
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredClasses}
          onRowClick={(cls) => {
            setSelectedClass(cls);
            setShowClassDetailsModal(true);
          }}
        />
      </div>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">{editingClassId ? 'Edit Class' : 'Add New Class'}</h3>
              <button
                onClick={() => {
                  setShowAddClassModal(false);
                  setEditingClassId(null); // Reset editing state when closing modal
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddClass(); }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newClass.name}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Enter class name (e.g., Grade 10A)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    name="grade_level"
                    value={newClass.grade_level}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select grade level</option>
                    <option value="creche">Creche</option>
                    <option value="kindergarten">Kindergarten</option>
                    <option value="lower_primary">Lower Primary</option>
                    <option value="upper_primary">Upper Primary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher
                  </label>
                  <select
                    name="class_teacher"
                    value={newClass.class_teacher}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classroom Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={newClass.capacity}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Enter classroom capacity"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newClass.status}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={fillDummyClass}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fill dummy data
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ffe600] text-gray-900 rounded-lg hover:bg-[#f5dc00]"
                >
                  {editingClassId ? 'Update Class' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {showClassDetailsModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiBook className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Class Details</h3>
                  <p className="text-sm text-gray-500">Full class information</p>
                </div>
              </div>
              <button
                onClick={() => setShowClassDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Class Summary Card */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                      <FiBook className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-800">{selectedClass.name || 'N/A'}</h4>
                      <p className="text-gray-600">{selectedClass.class_level || selectedClass.grade_level || 'N/A'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <StatusBadge status={selectedClass.status || 'active'} />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedClass.student_count || 0} Students
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        // Fetch students for this class
                        const students = await api.classes.students(selectedClass.id);
                        setClassStudents(students);
                        setShowStudentListModal(true);
                      } catch (error) {
                        console.error('Error fetching students:', error);
                        alert('Error fetching students for this class');
                      }
                    }}
                    className="px-4 py-2 bg-[#ffe600] text-gray-900 rounded-lg hover:bg-[#f5dc00] transition-colors text-sm"
                  >
                    View Student List
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Class Information */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-blue-600 flex items-center">
                    <FiBook className="mr-2" /> Class Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Class Name</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedClass.name || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Grade Level</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedClass.class_level || selectedClass.grade_level || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Class Teacher</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedClass.teacher_name || selectedClass.class_teacher_name || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Capacity</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedClass.capacity || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Current Students</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedClass.student_count || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                      <p className="text-gray-900 font-medium mt-1">
                        <StatusBadge status={selectedClass.status || 'active'} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowClassDetailsModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Set the selected class data to the newClass state for editing
                    setNewClass({
                      name: selectedClass.name || '',
                      grade_level: selectedClass.grade_level || selectedClass.class_level || '',
                      capacity: selectedClass.capacity || 30,
                      class_teacher: selectedClass.class_teacher || selectedClass.class_teacher_id || '',
                      status: selectedClass.status || 'active'
                    });
                    setEditingClassId(selectedClass.id); // Set the ID for editing
                    setShowClassDetailsModal(false);
                    setShowAddClassModal(true); // Reuse the add modal for editing
                  }}
                  className="px-5 py-2.5 bg-[#ffe600] text-gray-900 rounded-lg hover:bg-[#f5dc00] transition-colors flex items-center"
                >
                  <FiBook className="mr-2" /> Edit Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student List Modal */}
      {showStudentListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Students in {selectedClass?.name || 'Class'}</h3>
                <p className="text-sm text-gray-500">{classStudents.length} students enrolled</p>
              </div>
              <button
                onClick={() => setShowStudentListModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {classStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classStudents.map((student: any) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.full_name || `${student.first_name} ${student.last_name}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{student.student_id || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.gender || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={student.status || 'active'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No students found in this class</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <FiArrowUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Promote Pre school Students</h3>
                  <p className="text-xs text-gray-600 mt-1">Manual Pre school to Kindergarten Promotion</p>
                </div>
              </div>
              <button
                onClick={() => setShowPromotionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Note:</strong> Regular student promotions (KG to Class levels) happen automatically at the end of each term. This form is only for manually promoting Pre school (Creche) students to Kindergarten.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPromotionModal(false);
                  handleShowCrechePromotion();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FiArrowUp className="w-4 h-4" />
                <span>Promote Pre school Students</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* End Promotion Modal */}

      {/* Creche Student Promotion Modal */}
      {showCrechePromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <FiUsers className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Promote Pre school Students</h3>
                  <p className="text-xs text-gray-600 mt-1">Select students to promote to KG 1</p>
                </div>
              </div>
              <button
                onClick={() => setShowCrechePromotionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {crecheStudents.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedCrecheStudents.size} of {crecheStudents.length} selected
                    </p>
                    <button
                      onClick={() => {
                        if (selectedCrecheStudents.size === crecheStudents.length) {
                          setSelectedCrecheStudents(new Set());
                        } else {
                          setSelectedCrecheStudents(new Set(crecheStudents.map((s: any) => s.id)));
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedCrecheStudents.size === crecheStudents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {crecheStudents.map((student: any) => (
                      <div
                        key={student.id}
                        onClick={() => toggleCrecheStudent(student.id)}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCrecheStudents.has(student.id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {student.full_name || `${student.first_name} ${student.last_name}`}
                          </p>
                          <p className="text-xs text-gray-500">{student.student_id || 'N/A'}</p>
                        </div>
                        <div className="ml-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {student.gender || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No Pre school students found</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setShowCrechePromotionModal(false)}
                disabled={promotingStudents}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteCrecheStudents}
                disabled={promotingStudents || selectedCrecheStudents.size === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiArrowUp className="w-4 h-4" />
                <span>{promotingStudents ? 'Promoting...' : `Promote (${selectedCrecheStudents.size})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

