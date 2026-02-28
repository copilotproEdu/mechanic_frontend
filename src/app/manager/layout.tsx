'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="manager" />
      <div 
        className="flex flex-col min-h-screen"
        style={{ 
          marginLeft: 'var(--sidebar-width, 16rem)',
          transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'margin-left'
        } as React.CSSProperties} 
        id="main-content"
      >
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
