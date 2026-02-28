'use client';

import { useState, ReactNode, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  FiHome,
  FiTruck,
  FiFileText,
  FiCreditCard,
  FiBox,
  FiBarChart2,
  FiBell,
  FiSettings,
  FiUsers,
  FiTool,
  FiClipboard,
  FiMenu,
  FiSearch,
  FiX,
} from 'react-icons/fi';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTabletView, setIsTabletView] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // TODO: Fetch from API
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHasNoMatch, setSearchHasNoMatch] = useState(false);

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'dashboard') {
      return 'Dashboard';
    }
    if (segments[0] === 'cars' && segments.length > 1) {
      return 'Car Details';
    }
    const lastSegment = segments[segments.length - 1] || 'Dashboard';
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.first_name || userData.email);
      } catch (e) {
        setUserName('User');
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarOpen(!JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const handleChange = () => {
      const isTablet = mediaQuery.matches;
      setIsTabletView(isTablet);
      if (isTablet) {
        setSidebarOpen(false);
      }
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const toggleSidebar = () => {
    const nextOpen = !sidebarOpen;
    setSidebarOpen(nextOpen);
    if (!isTabletView) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(!nextOpen));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handlePageSearch = useCallback((query?: string) => {
    const term = (query ?? searchQuery).trim();
    if (!term) {
      setSearchHasNoMatch(false);
      return;
    }

    const found = typeof window !== 'undefined'
      ? (window as any).find(term, false, false, true, false, false, false)
      : false;

    setSearchHasNoMatch(!found);
  }, [searchQuery]);

  const navGroups = {
    ceo: [
      {
        heading: 'Main',
        items: [
          { label: 'Dashboard', href: '/dashboard/ceo', icon: FiHome },
          { label: 'Cars', href: '/cars', icon: FiTruck },
          { label: 'Invoices', href: '/invoices', icon: FiFileText },
          { label: 'Inventory', href: '/inventory', icon: FiBox },
          { label: 'Reports', href: '/reports', icon: FiBarChart2 },
        ],
      },
      {
        heading: 'Payments',
        items: [
          { label: 'Payments Overview', href: '/payments', icon: FiCreditCard },
          { label: 'Record Payment', href: '/payments/record', icon: FiCreditCard },
          { label: 'Inventory Supplier', href: '/payments/inventory-supplier', icon: FiCreditCard },
          { label: 'Outsourced Services', href: '/payments/outsourced-services', icon: FiCreditCard },
        ],
      },
      {
        heading: 'System',
        items: [
          { label: 'Notifications', href: '/notifications', icon: FiBell },
          { label: 'Settings', href: '/settings', icon: FiSettings },
        ],
      },
    ],
    manager: [
      {
        heading: 'Main',
        items: [
          { label: 'Dashboard', href: '/dashboard/manager', icon: FiHome },
          { label: 'Cars', href: '/cars', icon: FiTruck },
          { label: 'Invoices', href: '/invoices', icon: FiFileText },
          { label: 'Inventory', href: '/inventory', icon: FiBox },
          { label: 'Vendors', href: '/vendors', icon: FiUsers },
        ],
      },
      {
        heading: 'Payments',
        items: [
          { label: 'Payments Overview', href: '/payments', icon: FiCreditCard },
          { label: 'Record Payment', href: '/payments/record', icon: FiCreditCard },
          { label: 'Inventory Supplier', href: '/payments/inventory-supplier', icon: FiCreditCard },
          { label: 'Outsourced Services', href: '/payments/outsourced-services', icon: FiCreditCard },
        ],
      },
      {
        heading: 'System',
        items: [
          { label: 'Notifications', href: '/notifications', icon: FiBell },
        ],
      },
    ],
    mechanic: [
      {
        heading: 'Main',
        items: [
          { label: 'Dashboard', href: '/dashboard/mechanic', icon: FiHome },
          { label: 'Cars', href: '/cars', icon: FiTruck },
          { label: 'Diagnostics', href: '/diagnostics', icon: FiTool },
          { label: 'Inventory', href: '/inventory', icon: FiBox },
        ],
      },
      {
        heading: 'System',
        items: [
          { label: 'Notifications', href: '/notifications', icon: FiBell },
        ],
      },
    ],
    receptionist: [
      {
        heading: 'Main',
        items: [
          { label: 'Dashboard', href: '/dashboard/receptionist', icon: FiHome },
          { label: 'Car Intake', href: '/cars/intake', icon: FiClipboard },
          { label: 'Cars', href: '/cars', icon: FiTruck },
          { label: 'Invoices', href: '/invoices', icon: FiFileText },
        ],
      },
      {
        heading: 'Payments',
        items: [
          { label: 'Payments Overview', href: '/payments', icon: FiCreditCard },
          { label: 'Record Payment', href: '/payments/record', icon: FiCreditCard },
          { label: 'Inventory Supplier', href: '/payments/inventory-supplier', icon: FiCreditCard },
          { label: 'Outsourced Services', href: '/payments/outsourced-services', icon: FiCreditCard },
        ],
      },
      {
        heading: 'System',
        items: [
          { label: 'Notifications', href: '/notifications', icon: FiBell },
        ],
      },
    ],
  };

  const roleNavGroups: NavGroup[] = (navGroups[userRole as keyof typeof navGroups] || navGroups.receptionist) as NavGroup[];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen overflow-hidden relative flex">
        {isTabletView && sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/20 z-20"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        <aside
          className={`${isTabletView ? 'absolute left-0 top-0 bottom-0 z-30 w-64 sm:w-56' : sidebarOpen ? 'w-56' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isTabletView ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}
        >
          <div className="h-12 px-4 border-b border-gray-200 flex items-center justify-between">
            <div className={`font-semibold text-sm text-gray-800 ${!sidebarOpen && !isTabletView ? 'hidden' : ''}`}>Brooks Mechanics MS</div>
            <button
              onClick={toggleSidebar}
              className="w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-800 flex items-center justify-center"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isTabletView ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-4">
            {roleNavGroups.map((group) => (
              <div key={group.heading}>
                {(sidebarOpen || isTabletView) && (
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 px-3 mb-2">{group.heading}</p>
                )}
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/payments'
                      ? pathname === '/payments'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center ${sidebarOpen || isTabletView ? 'justify-start gap-3 px-3' : 'justify-center px-2'} py-2 rounded-lg transition ${
                          isActive
                            ? 'bg-primary-500 text-gray-900 font-semibold'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {(sidebarOpen || isTabletView) && <span className="text-sm">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-2 space-y-2">
            {(sidebarOpen || isTabletView) && (
              <div className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs font-semibold text-gray-800 truncate">{userName || 'User Name'}</p>
                <p className="text-[11px] text-gray-500 truncate">{getPageTitle()}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full ${sidebarOpen || isTabletView ? 'px-3 justify-start' : 'px-2 justify-center'} py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-gray-900 transition`}
            >
              <FiSettings className="w-4 h-4" />
              {(sidebarOpen || isTabletView) && 'Log Out'}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
          <header className="h-12 px-3 md:px-5 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {isTabletView && (
                <button
                  onClick={toggleSidebar}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center"
                  aria-label="Open sidebar"
                >
                  <FiMenu className="w-4 h-4" />
                </button>
              )}
              <p className="text-sm font-semibold text-gray-800 truncate">{getPageTitle()}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className={`hidden md:flex items-center gap-1.5 bg-white border rounded-lg px-2 py-1 w-44 lg:w-56 ${searchHasNoMatch ? 'border-red-300' : 'border-gray-200'}`}>
                <input
                  type="text"
                  placeholder="Search this page"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchHasNoMatch) setSearchHasNoMatch(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePageSearch();
                    }
                  }}
                  className="w-full bg-transparent text-[11px] leading-4 text-gray-700 placeholder:text-gray-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handlePageSearch()}
                  className="w-5 h-5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 flex items-center justify-center"
                  aria-label="Search current page"
                >
                  <FiSearch className="w-3 h-3" />
                </button>
              </div>
              <Link href="/notifications">
                <button className="relative w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center">
                  <FiBell className="w-3.5 h-3.5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#1f2329] text-primary-100 text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-0.5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-2.5 sm:p-3 md:p-4 lg:p-5 font-sans text-sm leading-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
