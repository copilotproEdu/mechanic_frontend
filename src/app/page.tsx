'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Check both possible locations for user type
        const userType = userData.user_type || userData.profile?.role;

        console.log('Root redirect - User data:', userData);
        console.log('Root redirect - User type:', userType);

        // Validate userType exists and is valid
        const validRoles = ['ceo', 'manager', 'mechanic', 'receptionist'];
        if (!userType || !validRoles.includes(userType)) {
          console.log('Invalid or missing userType, redirecting to login');
          localStorage.clear();
          router.replace('/login');
          return;
        }

        // Redirect based on user role
        if (userType === 'ceo') {
          router.replace('/dashboard/ceo');
        } else if (userType === 'manager') {
          router.replace('/dashboard/manager');
        } else if (userType === 'mechanic') {
          router.replace('/dashboard/mechanic');
        } else {
          router.replace('/dashboard/receptionist');
        }
      } catch {
        localStorage.clear();
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">AutoShop Pro</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
