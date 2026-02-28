'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import { api } from '@/lib/api';
import { UserRole } from '@/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('administrator');
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // Check if user must change password
    const checkPasswordStatus = async () => {
      try {
        const user = await api.users.me();
        setUserRole(user.role as UserRole);
        
        if (user.must_change_password) {
          setShowPasswordModal(true);
          setIsFirstTime(true);
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    checkPasswordStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={userRole} />
      <div 
        className="flex flex-col min-h-screen admin-main-content"
        id="main-content"
      >
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
      
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => !isFirstTime && setShowPasswordModal(false)}
        isFirstTime={isFirstTime}
        userRole={userRole}
      />
    </div>
  );
}
