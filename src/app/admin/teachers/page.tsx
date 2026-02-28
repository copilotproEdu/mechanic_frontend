'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { FiUser, FiUsers, FiMail, FiPhone, FiBook, FiCheckCircle, FiUserPlus, FiPlus, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';
import { formatDate, formatDateForInput, convertToISODate } from '@/lib/dateUtils';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showTeacherDetailsModal, setShowTeacherDetailsModal] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [newTeacher, setNewTeacher] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    join_date: '',
    qualification: '',
    specialization: '',
    experience_years: 0,
    contract_type: 'full-time',
    status: 'active',
    department: ''
  });

  const fillDummyTeacher = () => {
    const firstNames = ['Kwame', 'Esi', 'Kofi', 'Ama', 'Kojo', 'Akua'];
    const lastNames = ['Owusu', 'Mensah', 'Boateng', 'Tetteh', 'Asare', 'Appiah'];
    const qualifications = ['B.Ed', 'M.Ed', 'B.Sc', 'M.Sc'];
    const specializations = ['Mathematics', 'English', 'Science', 'ICT', 'History'];
    const departments = ['creche', 'kindergarten', 'lower primary', 'upper primary'];
    const contracts = ['full-time', 'part-time', 'contract'];
    const genders = ['male', 'female'];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const qualification = qualifications[Math.floor(Math.random() * qualifications.length)];
    const specialization = specializations[Math.floor(Math.random() * specializations.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const contract = contracts[Math.floor(Math.random() * contracts.length)];
    const experience = Math.floor(Math.random() * 16);
    const dobYear = 1978 + Math.floor(Math.random() * 20);
    const joinYear = 2016 + Math.floor(Math.random() * 8);
    const dob = `${dobYear}-0${1 + Math.floor(Math.random() * 9)}-${10 + Math.floor(Math.random() * 18)}`;
    const joinDate = `${joinYear}-0${1 + Math.floor(Math.random() * 9)}-${10 + Math.floor(Math.random() * 18)}`;

    setNewTeacher({
      first_name: first,
      last_name: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone: `02${Math.floor(10000000 + Math.random() * 90000000)}`,
      date_of_birth: dob,
      gender,
      join_date: joinDate,
      qualification,
      specialization,
      experience_years: experience,
      contract_type: contract,
      status: 'active',
      department
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersData, statsData] = await Promise.all([
        api.teachers.list(),
        api.teachers.statistics()
      ]);
      
      setTeachers(teachersData.results || teachersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = async () => {
    try {
      const teacherData = {
        ...newTeacher,
        experience_years: Number(newTeacher.experience_years) || 0
      };

      let updatedTeacher: any;
      if (editingTeacherId) {
        // Update existing teacher - ALWAYS send JSON first to test if data saves
        console.log('Updating teacher with data:', teacherData);
        updatedTeacher = await api.teachers.update(editingTeacherId, teacherData);
        console.log('Updated teacher response:', updatedTeacher);
        
        // If photo was selected and saved successfully, then update photo separately
        if (photoFile && updatedTeacher) {
          const photoFormData = new FormData();
          photoFormData.append('profile_photo', photoFile);
          console.log('Updating teacher photo separately');
          console.log('Photo file:', photoFile);
          console.log('Photo file name:', photoFile.name);
          console.log('Photo file size:', photoFile.size);
          console.log('Photo file type:', photoFile.type);
          console.log('FormData entries:', Array.from(photoFormData.entries()));
          
          // Log FormData contents
          for (let [key, value] of photoFormData.entries()) {
            console.log(`FormData - ${key}:`, value);
          }
          
          try {
            const photoUpdateResponse = await api.teachers.update(editingTeacherId, photoFormData);
            console.log('Photo update response:', photoUpdateResponse);
            console.log('Profile photo in response:', photoUpdateResponse?.profile_photo);
            updatedTeacher = photoUpdateResponse;
          } catch (photoError) {
            console.error('Error updating photo:', photoError);
            alert(`Photo upload error: ${JSON.stringify(photoError?.response?.data || photoError?.message)}`);
          }
        }
        
        setTeachers(prev => prev.map(t => t.id === editingTeacherId ? updatedTeacher : t));
        setSelectedTeacher(updatedTeacher);
      } else {
        // Create new teacher
        console.log('Creating teacher with data:', teacherData);
        updatedTeacher = await api.teachers.create(teacherData);
        console.log('Created teacher response:', updatedTeacher);
        
        // If photo was selected, add it separately
        if (photoFile && updatedTeacher) {
          const photoFormData = new FormData();
          photoFormData.append('profile_photo', photoFile);
          console.log('Adding photo to newly created teacher');
          console.log('Photo file:', photoFile);
          console.log('Photo file name:', photoFile.name);
          console.log('Photo file size:', photoFile.size);
          console.log('Photo file type:', photoFile.type);
          console.log('FormData entries:', Array.from(photoFormData.entries()));
          const photoUpdateResponse = await api.teachers.update(updatedTeacher.id, photoFormData);
          console.log('Photo add response:', photoUpdateResponse);
          updatedTeacher = photoUpdateResponse;
        }
        
        setTeachers(prev => [updatedTeacher, ...prev]);

        // Update stats for new teacher
        if (stats) {
          setStats((prev: any) => ({
            ...prev,
            total_teachers: prev.total_teachers + 1,
            active_teachers: newTeacher.status === 'active' ? prev.active_teachers + 1 : prev.active_teachers
          }));
        }
      }

      // Reset form and close modal
      setNewTeacher({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        join_date: '',
        qualification: '',
        specialization: '',
        experience_years: 0,
        contract_type: 'full-time',
        status: 'active',
        department: ''
      });
      setPhotoFile(null);
      setPhotoPreview('');
      setEditingTeacherId(null);
      setShowAddTeacherModal(false);
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      const errorMsg = error?.response?.data || error?.message || 'Unknown error';
      console.error('Error details:', errorMsg);
      alert(`Error saving teacher: ${JSON.stringify(errorMsg)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const columns = [
    {
      key: 'name',
      header: 'Teacher Name',
      render: (teacher: any) => teacher.full_name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim()
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'department',
      header: 'Department',
      render: (teacher: any) => teacher.department || 'N/A'
    },
    { key: 'qualification', header: 'Qualification' },
    { 
      key: 'join_date', 
      header: 'Join Date',
      render: (teacher: any) => teacher?.join_date ? formatDate(teacher.join_date) : 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      render: (teacher: any) => <StatusBadge status={teacher.status || 'active'} />
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Teachers"
          value={stats?.total_teachers?.toString() || '0'}
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Teachers"
          value={stats?.active_teachers?.toString() || '0'}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="On Leave"
          value={stats?.on_leave_teachers?.toString() || '0'}
          icon={<FiUser className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Departments"
          value={stats?.total_departments?.toString() || '0'}
          icon={<FiBook className="w-6 h-6" />}
          color="primary"
        />
      </div>

      {/* Teachers Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Teachers</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search teachers..."
              className="input-field w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                setEditingTeacherId(null); // Reset editing state when adding new teacher
                setNewTeacher({
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone: '',
                  date_of_birth: '',
                  gender: '',
                  join_date: '',
                  qualification: '',
                  specialization: '',
                  experience_years: 0,
                  contract_type: 'full-time',
                  status: 'active',
                  department: ''
                }); // Reset form fields
                setPhotoFile(null);
                setPhotoPreview('');
                setShowAddTeacherModal(true);
              }}
              className="bg-[#ffe600] hover:bg-[#f5dc00] text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>
        
        <DataTable columns={columns} data={filteredTeachers} onRowClick={(teacher) => {
          setSelectedTeacher(teacher);
          setShowTeacherDetailsModal(true);
        }} />
      </div>

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">{editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button
                onClick={() => {
                  setShowAddTeacherModal(false);
                  setEditingTeacherId(null); // Reset editing state when closing modal
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddTeacher(); }} className="p-6">
              {/* Photo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : selectedTeacher?.profile_photo ? (
                      <img
                        src={selectedTeacher.profile_photo}
                        alt="Current"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <span className="text-gray-400 text-xs text-center">No photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="input-field flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Personal Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={newTeacher.first_name}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="First name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={newTeacher.last_name}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Last name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newTeacher.email}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Email address (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newTeacher.phone}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formatDateForInput(newTeacher.date_of_birth)}
                    onChange={(e) => {
                      const isoDate = convertToISODate(e.target.value);
                      setNewTeacher({...newTeacher, date_of_birth: isoDate});
                    }}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={newTeacher.gender}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Professional Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    name="join_date"
                    value={formatDateForInput(newTeacher.join_date)}
                    onChange={(e) => {
                      const isoDate = convertToISODate(e.target.value);
                      setNewTeacher({...newTeacher, join_date: isoDate});
                    }}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={newTeacher.qualification}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="e.g., Bachelor's Degree"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={newTeacher.specialization}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={newTeacher.experience_years}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Years"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={newTeacher.department}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="creche">Creche</option>
                    <option value="kindergarten">Kindergarten</option>
                    <option value="lower primary">Lower Primary</option>
                    <option value="upper primary">Upper Primary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Type
                  </label>
                  <select
                    name="contract_type"
                    value={newTeacher.contract_type}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newTeacher.status}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={fillDummyTeacher}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fill dummy data
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ffe600] text-gray-900 rounded-lg hover:bg-[#f5dc00]"
                >
                  {editingTeacherId ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Details Modal */}
      {showTeacherDetailsModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <FiUser className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Teacher Details</h3>
                  <p className="text-sm text-gray-500">Full profile information</p>
                </div>
              </div>
              <button
                onClick={() => setShowTeacherDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Teacher Summary Card */}
              <div className="flex justify-center mb-6">
                <div className="inline-block bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center text-center space-x-4">
                    {selectedTeacher.profile_photo ? (
                      <>
                        {console.log('Displaying teacher photo:', selectedTeacher.profile_photo)}
                        <img
                          src={selectedTeacher.profile_photo}
                          alt={selectedTeacher.full_name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                        />
                      </>
                    ) : (
                      <>
                        {console.log('No teacher photo, showing icon. selectedTeacher:', selectedTeacher)}
                        <div className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                          <FiUser className="w-8 h-8 text-gray-400" />
                        </div>
                      </>
                    )}
                    <div className="text-left">
                      <h4 className="text-base font-bold text-gray-800">
                        {selectedTeacher.first_name !== undefined && selectedTeacher.first_name !== null ?
                          `${selectedTeacher.first_name} ${selectedTeacher.last_name}` :
                          (selectedTeacher.full_name ? selectedTeacher.full_name : 'N/A')}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedTeacher.qualification || 'N/A'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <StatusBadge status={selectedTeacher.status || 'active'} />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedTeacher.teacher_id || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-gray-700 flex items-center">
                    <FiUser className="mr-2" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">First Name</p>
                      <p className="text-gray-900 font-medium mt-1">
                        {selectedTeacher.first_name !== undefined && selectedTeacher.first_name !== null ?
                          selectedTeacher.first_name :
                          (selectedTeacher.full_name ?
                            selectedTeacher.full_name.split(' ').length > 1 ?
                              selectedTeacher.full_name.split(' ').slice(0, -1).join(' ') // All parts except last
                              : selectedTeacher.full_name // If only one part, use it as first name
                          : 'N/A')}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Last Name</p>
                      <p className="text-gray-900 font-medium mt-1">
                        {selectedTeacher.last_name !== undefined && selectedTeacher.last_name !== null ?
                          selectedTeacher.last_name :
                          (selectedTeacher.full_name ?
                            selectedTeacher.full_name.split(' ').length > 1 ?
                              selectedTeacher.full_name.split(' ').slice(-1).join(' ') // Last part only
                              : '' // Empty if only one name part
                          : 'N/A')}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.email || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.phone || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.date_of_birth ? formatDate(selectedTeacher.date_of_birth) : 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.gender || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-gray-700 flex items-center">
                    <FiBook className="mr-2" /> Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Join Date</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.join_date ? formatDate(selectedTeacher.join_date) : 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.department || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Qualification</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.qualification || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Specialization</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.specialization || 'N/A'}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Years of Experience</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.experience_years || 0}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Contract Type</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedTeacher.contract_type || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowTeacherDetailsModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Set the selected teacher data to the newTeacher state for editing
                    // Handle case where API returns full_name instead of separate first_name/last_name
                    const firstName = selectedTeacher.first_name ||
                                    (selectedTeacher.full_name ?
                                      selectedTeacher.full_name.split(' ').length > 1 ?
                                        selectedTeacher.full_name.split(' ').slice(0, -1).join(' ')
                                        : selectedTeacher.full_name
                                      : '');
                    const lastName = selectedTeacher.last_name ||
                                   (selectedTeacher.full_name ?
                                     selectedTeacher.full_name.split(' ').length > 1 ?
                                       selectedTeacher.full_name.split(' ').slice(-1).join(' ')
                                       : ''
                                     : '');

                    setNewTeacher({
                      first_name: firstName,
                      last_name: lastName,
                      email: selectedTeacher.email || '',
                      phone: selectedTeacher.phone || '',
                      date_of_birth: selectedTeacher.date_of_birth || '',
                      gender: selectedTeacher.gender || '',
                      join_date: selectedTeacher.join_date || '',
                      qualification: selectedTeacher.qualification || '',
                      specialization: selectedTeacher.specialization || '',
                      experience_years: selectedTeacher.experience_years || 0,
                      contract_type: selectedTeacher.contract_type || 'full-time',
                      status: selectedTeacher.status || 'active',
                      department: selectedTeacher.department || ''
                    });
                    setPhotoFile(null);
                    setPhotoPreview(selectedTeacher.profile_photo || '');
                    setEditingTeacherId(selectedTeacher.id); // Set the ID for editing
                    setShowTeacherDetailsModal(false);
                    setShowAddTeacherModal(true); // Reuse the add modal for editing
                  }}
                  className="px-5 py-2.5 bg-[#ffe600] text-gray-900 rounded-lg hover:bg-[#f5dc00] transition-colors flex items-center"
                >
                  <FiUser className="mr-2" /> Edit Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

