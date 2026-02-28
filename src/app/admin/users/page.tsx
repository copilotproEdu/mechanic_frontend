'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiShield, FiPlus, FiX, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { api } from '@/lib/api';

const roleColors: { [key: string]: string } = {
  'admin': 'bg-primary-100 text-primary-700',
  'headteacher': 'bg-blue-100 text-blue-700',
  'teacher': 'bg-green-100 text-green-700',
  'parent': 'bg-purple-100 text-purple-700',
};

const roleNames: { [key: string]: string } = {
  'admin': 'Admin',
  'headteacher': 'Head Teacher',
  'teacher': 'Teacher',
  'parent': 'Parent',
};

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'parent',
    password: '',
    password_confirm: '',
    children_ids: [] as number[]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStudents();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await api.users.list();
      setUsers(usersData.results || usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsData = await api.students.list();
      setStudents(studentsData.results || studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.password_confirm) {
      alert('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await api.users.create(formData);
      alert('User created successfully');
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.users.delete(id);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'parent',
      password: '',
      password_confirm: '',
      children_ids: []
    });
  };

  const fillDummyUser = () => {
    const firstNames = ['Ama', 'Kofi', 'Lydia', 'Yaw', 'Akosua', 'Kwesi'];
    const lastNames = ['Boateng', 'Owusu', 'Mensah', 'Asare', 'Tetteh', 'Appiah'];
    const roles = ['parent', 'teacher', 'headteacher', 'admin'];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const phone = `02${Math.floor(10000000 + Math.random() * 90000000)}`;
    const role = roles[Math.floor(Math.random() * roles.length)];
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;

    setFormData({
      username: phone.replace(/\D/g, ''),
      first_name: first,
      last_name: last,
      email,
      phone,
      role,
      password: 'changeme123',
      password_confirm: 'changeme123',
      children_ids: []
    });
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            className="input-field w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
            <FiPlus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Username</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                  {user.must_change_password && (
                    <span className="ml-2 text-xs text-orange-600">(Password reset required)</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                    <FiShield className="w-3 h-3" />
                    {roleNames[user.role] || user.role}
                  </span>
                  {user.role === 'parent' && user.children_count > 0 && (
                    <span className="ml-2 text-xs text-gray-500">({user.children_count} child{user.children_count > 1 ? 'ren' : ''})</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-primary-600 hover:text-primary-800 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">Add New User</h3>
              <button onClick={() => {setIsModalOpen(false); resetForm();}} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="input-field pl-10"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="label">Last Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="input-field pl-10"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="label">Phone Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      className="input-field pl-10"
                      placeholder="e.g., 0201234567"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({...formData, phone: e.target.value, username: e.target.value.replace(/\D/g, '')});
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This will be used as the username</p>
                </div>
                
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      className="input-field pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="label">Role *</label>
                  <select
                    required
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value, children_ids: []})}
                  >
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="headteacher">Head Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Username *</label>
                  <input
                    type="text"
                    required
                    className="input-field bg-gray-100"
                    value={formData.username}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated from phone</p>
                </div>
                
                {formData.role === 'parent' && (
                  <div className="col-span-2">
                    <label className="label">Link Children</label>
                    <select
                      multiple
                      className="input-field h-32"
                      value={formData.children_ids.map(String)}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        setFormData({...formData, children_ids: selected});
                      }}
                    >
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} - {student.student_id} (Class: {student.current_class?.name || 'N/A'})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple children</p>
                  </div>
                )}
                
                <div>
                  <label className="label">Password (Optional)</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Leave blank for default"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: changeme123</p>
                </div>
                
                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={formData.password_confirm}
                    onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={fillDummyUser}
                  className="btn-secondary flex-1"
                >
                  Fill dummy data
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {setIsModalOpen(false); resetForm();}}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


