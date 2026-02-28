'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const OFFLINE_TIMEOUT_MS = 15 * 60 * 1000;

interface SessionTimeoutGuardProps {
  children: ReactNode;
}

export default function SessionTimeoutGuard({ children }: SessionTimeoutGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearSession = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      if (pathname !== '/login') {
        router.replace('/login');
      }
    };

    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const startTimer = () => {
      if (timeoutRef.current !== null) {
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        const stillLoggedIn = localStorage.getItem('access_token');
        if (stillLoggedIn) {
          clearSession();
        }
      }, OFFLINE_TIMEOUT_MS);
    };

    const handleOffline = () => {
      startTimer();
    };

    const handleOnline = () => {
      clearTimer();
    };

    if (!navigator.onLine) {
      startTimer();
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearTimer();
    };
  }, [pathname, router]);

  return <>{children}</>;
}
