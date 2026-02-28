'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiUser, FiCalendar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function FeeStatusPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [feeStatus, setFeeStatus] = useState<any[]>([]);
  const [feedingFeeStatus, setFeedingFeeStatus] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchFeeStatus();
  }, []);

  const fetchFeeStatus = async () => {
    try {
      setLoading(true);
      
      // Get user info
      const user = await api.users.me();
      setUserRole(user.role);
      
      if (user.role === 'parent') {
        // Fetch all students
        const studentsData = await api.students.list();
        const allStudents = Array.isArray(studentsData) ? studentsData : studentsData.results || [];
        
        // Filter to parent's children
        const myChildren = allStudents.filter((student: any) => 
          student.parent_phone === user.phone
        );
        setChildren(myChildren);
        
        // Fetch fee status for each child
        const [schoolFees, feedingFees] = await Promise.all([
          api.fees.studentFees.fee_owers(),
          api.fees.studentFeedingFees.fee_owers()
        ]);
        
        const schoolFeesList = Array.isArray(schoolFees) ? schoolFees : schoolFees.results || [];
        const feedingFeesList = Array.isArray(feedingFees) ? feedingFees : feedingFees.results || [];
        
        // Filter to only this parent's children
        const childIds = myChildren.map((c: any) => c.id);
        setFeeStatus(schoolFeesList.filter((f: any) => childIds.includes(f.student)));
        setFeedingFeeStatus(feedingFeesList.filter((f: any) => childIds.includes(f.student)));
      }
    } catch (error) {
      console.error('Error fetching fee status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChildById = (id: number) => {
    return children.find((c: any) => c.id === id);
  };

  const formatCurrency = (amount: number) => {
    return `GH₵ ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fee status...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'parent') {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          This page is only accessible to parents.
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          No children found linked to your account.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Children</p>
              <p className="text-2xl font-bold text-gray-900">{children.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">School Fees Owed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(feeStatus.reduce((sum, f) => sum + (f.balance_due || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Feeding Fees Owed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(feedingFeeStatus.reduce((sum, f) => sum + (f.balance_due || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Children Fee Details */}
      <div className="space-y-6">
        {children.map((child: any) => {
          const schoolFee = feeStatus.find((f: any) => f.student === child.id);
          const feedingFee = feedingFeeStatus.find((f: any) => f.student === child.id);
          const totalOwed = (schoolFee?.balance_due || 0) + (feedingFee?.balance_due || 0);

          return (
            <div key={child.id} className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {child.profile_photo ? (
                      <img src={child.profile_photo} alt={child.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {child.first_name} {child.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Class: {child.current_class?.name || 'N/A'} | Student ID: {child.student_id}
                    </p>
                  </div>
                </div>
                
                {totalOwed > 0 ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4" />
                    Fees Outstanding
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4" />
                    All Paid
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* School Fees */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    School Fees
                  </h4>
                  {schoolFee ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Fee:</span>
                        <span className="font-medium">{formatCurrency(schoolFee.total_fee || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">{formatCurrency(schoolFee.amount_paid || 0)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Balance:</span>
                        <span className={`font-bold ${schoolFee.balance_due > 0 ? 'text-primary-600' : 'text-green-600'}`}>
                          {formatCurrency(schoolFee.balance_due || 0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No fee record found</p>
                  )}
                </div>

                {/* Feeding Fees */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    Feeding Fees
                  </h4>
                  {feedingFee ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Fee:</span>
                        <span className="font-medium">{formatCurrency(feedingFee.total_fee || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">{formatCurrency(feedingFee.amount_paid || 0)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Balance:</span>
                        <span className={`font-bold ${feedingFee.balance_due > 0 ? 'text-primary-600' : 'text-green-600'}`}>
                          {formatCurrency(feedingFee.balance_due || 0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No fee record found</p>
                  )}
                </div>
              </div>

              {totalOwed > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Total Outstanding:</strong> {formatCurrency(totalOwed)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Please contact the school office for payment arrangements.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
