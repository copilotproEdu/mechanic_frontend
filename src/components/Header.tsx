'use client';

import { FiBell, FiSearch, FiMail, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';

const Header = memo(function Header() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved) {
      const initialState = JSON.parse(saved);
      setIsCollapsed(initialState);
    } else {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      if (mediaQuery.matches) {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(true));
        setIsCollapsed(true);
      }
    }

    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newState = customEvent.detail.isCollapsed;
      setIsCollapsed(newState);
    };
    
    window.addEventListener('sidebarToggle', handleToggle);
    return () => window.removeEventListener('sidebarToggle', handleToggle);
  }, []);
  
  const toggleSidebar = useCallback(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    const currentState = saved ? JSON.parse(saved) : isCollapsed;
    const newState = !currentState;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    // Update CSS variable immediately for smooth transition
    document.documentElement.style.setProperty(
      '--sidebar-width',
      newState ? '5rem' : '16rem'
    );
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed: newState } }));
  }, [isCollapsed]);
  
  const pageTitle = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 h-8 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center flex-1 gap-2">
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center p-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-1.5">
        <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <FiSearch className="w-3.5 h-3.5" />
        </button>
        
        <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <FiMail className="w-3.5 h-3.5" />
        </button>
        
        <button className="relative p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <FiBell className="w-3.5 h-3.5" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
});

export default Header;
