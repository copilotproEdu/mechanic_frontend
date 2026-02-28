'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, memo } from 'react';
import {
  FiHome,
  FiUsers,
  FiBox,
  FiShoppingCart,
  FiPackage,
  FiFileText,
  FiSettings,
  FiBarChart2,
  FiGrid,
  FiTruck,
  FiMapPin,
  FiPieChart,
  FiLogOut,
  FiUser,
  FiBook,
  FiCheckCircle,
  FiDollarSign,
  FiChevronLeft
} from 'react-icons/fi';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
}

const managerMenuItems = [
  { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
  { name: 'Students', icon: FiUsers, path: '/admin/students' },
  { name: 'Teachers', icon: FiUser, path: '/admin/teachers' },
  { name: 'Classes', icon: FiBook, path: '/admin/classes' },
  { name: 'Attendance', icon: FiCheckCircle, path: '/admin/attendance' },
  { name: 'Fees', icon: FiDollarSign, path: '/admin/fees' },
  { name: 'Subjects', icon: FiBook, path: '/admin/subjects' },
  { name: 'Results', icon: FiFileText, path: '/admin/results' },
];

interface MenuGroup {
  title: string;
  items: Array<{
    name: string;
    icon: any;
    path: string;
    roles?: string[];
  }>;
}

const adminMenuGroups: MenuGroup[] = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard', roles: ['admin'] },
    ],
  },
  {
    title: 'Student Management',
    items: [
      { name: 'Students', icon: FiUsers, path: '/admin/students', roles: ['admin', 'headteacher'] },
      { name: 'Enrollment', icon: FiFileText, path: '/admin/enrollment', roles: ['admin', 'headteacher'] },
      { name: 'Attendance', icon: FiCheckCircle, path: '/admin/attendance', roles: ['admin', 'headteacher', 'teacher'] },
    ],
  },
  {
    title: 'Staff Management',
    items: [
      { name: 'Teachers', icon: FiUser, path: '/admin/teachers', roles: ['admin', 'headteacher'] },
    ],
  },
  {
    title: 'Academic Management',
    items: [
      { name: 'Classes', icon: FiBook, path: '/admin/classes', roles: ['admin', 'headteacher'] },
      { name: 'Subjects', icon: FiBook, path: '/admin/subjects', roles: ['admin', 'headteacher'] },
      { name: 'Academics', icon: FiFileText, path: '/admin/academics', roles: ['admin', 'headteacher'] },
      { name: 'Results', icon: FiFileText, path: '/admin/results', roles: ['admin', 'headteacher', 'teacher'] },
      { name: 'Timetable', icon: FiGrid, path: '/admin/timetable', roles: ['admin', 'headteacher', 'teacher'] },
    ],
  },
  {
    title: 'Financial Management',
    items: [
      { name: 'Fees', icon: FiDollarSign, path: '/admin/fees', roles: ['admin'] },
      { name: 'Fees Settings', icon: FiDollarSign, path: '/admin/fees-settings', roles: ['admin'] },
      { name: 'Fee Status', icon: FiDollarSign, path: '/admin/fee-status', roles: ['admin', 'headteacher', 'parent'] },
    ],
  },
  {
    title: 'Reports',
    items: [
      { name: 'Reports', icon: FiBarChart2, path: '/admin/reports', roles: ['admin', 'headteacher', 'parent'] },
      { name: 'Order of Merit', icon: FiBarChart2, path: '/admin/reports/order-of-merit', roles: ['admin', 'headteacher', 'teacher'] },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Users', icon: FiUsers, path: '/admin/users', roles: ['admin'] },
      { name: 'Settings', icon: FiSettings, path: '/admin/settings', roles: ['admin'] },
      { name: 'Audit Trail', icon: FiFileText, path: '/admin/audit-trail', roles: ['admin'] },
    ],
  },
];

// Filter menu groups based on user role
const filterMenuByRole = (menuGroups: MenuGroup[], userRole: string): MenuGroup[] => {
  return menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => 
        !item.roles || item.roles.includes(userRole)
      )
    }))
    .filter(group => group.items.length > 0);
};

export default memo(function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);
  
  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved) {
      const collapsed = JSON.parse(saved);
      setIsCollapsed(collapsed);
    } else if (isMobile) {
      setIsCollapsed(true);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(true));
    }
    
    // Listen for toggle events from Header
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newState = customEvent.detail.isCollapsed;
      setIsCollapsed(newState);
    };
    
    window.addEventListener('sidebarToggle', handleToggle);
    return () => window.removeEventListener('sidebarToggle', handleToggle);
  }, [isMobile]);

  useEffect(() => {
    const width = isMobile ? (isCollapsed ? '0rem' : '14rem') : (isCollapsed ? '5rem' : '14rem');
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [isCollapsed, isMobile]);

  const toggleSidebar = (nextState?: boolean) => {
    const newState = typeof nextState === 'boolean' ? nextState : !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed: newState } }));
  };
  
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('userRole');
    localStorage.removeItem('sidebarCollapsed');
    // Redirect to login page
    window.location.href = '/';
  };
  
  // Get user role from localStorage or use prop
  const [userRole, setUserRole] = useState<string>(role);
  const [userName, setUserName] = useState<string>('User');
  const [userPhone, setUserPhone] = useState<string>('');
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role || role);
        
        // Set user name (first_name + last_name or username)
        const fullName = userData.first_name && userData.last_name 
          ? `${userData.first_name} ${userData.last_name}`
          : userData.username || 'User';
        setUserName(fullName);
        
        // Set phone number
        setUserPhone(userData.phone || userData.username || '');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [role]);
  
  // Always use admin menu groups with role-based filtering
  // This ensures all roles see the correct filtered menu
  const menuGroups = filterMenuByRole(adminMenuGroups, userRole);

  return (
    <div id="sidebar-container" className={`bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-40 ${
      isCollapsed ? 'w-20' : 'w-56'
    } ${isMobile ? (isCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0') : ''}`} style={{
      transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'width, transform'
    }}>
      {/* Logo */}
      <div className="h-12 px-3 border-b border-gray-200 flex items-center flex-shrink-0">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-2 bg-gray-800"></div>
              <div className="w-1.5 h-2 bg-primary-500"></div>
            </div>
            <div className="flex gap-0.5">
              <div className="w-1.5 h-2 bg-primary-500"></div>
              <div className="w-1.5 h-2 bg-gray-800"></div>
            </div>
          </div>
          <div>
            <div className="font-bold text-gray-800 whitespace-nowrap" style={{ fontSize: '14px' }}>Emmilit Preparatory School</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-3 overflow-y-auto min-w-0">
        {/* All roles use the same admin menu groups with role-based filtering */}
        <div className={isCollapsed ? 'space-y-2' : 'space-y-5'}>
          {menuGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && <p className="text-xs font-semibold text-gray-500 uppercase px-3 mb-3">{group.title}</p>}
              <ul className={isCollapsed ? 'space-y-2' : 'space-y-2.5'}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  
                  return (
                    <li key={item.path} title={isCollapsed ? item.name : undefined}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-4 rounded-lg transition-all duration-200 group ${
                          isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'
                        } ${
                          isActive
                            ? 'bg-primary-500 text-neutral-900 shadow-sm border-l-4 border-primary-700 pl-2'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-neutral-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        {!isCollapsed && <span className="font-medium text-lg">{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* User Profile at Bottom */}
      <div className={`p-3 border-t border-gray-200 flex-shrink-0`}>
        <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-2'}`}>
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="https://i.pravatar.cc/48" alt="User" className="w-full h-full object-cover" loading="lazy" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.backgroundColor = 'var(--color-primary-500, #d4ad38)';
            }} />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userPhone}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
                title="Logout"
              >
                <FiLogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

