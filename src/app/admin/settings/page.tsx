'use client';

import Link from 'next/link';
import {
  FiUsers,
  FiBox,
  FiMapPin,
  FiSettings as FiSettingsIcon,
  FiTool,
  FiBriefcase
} from 'react-icons/fi';

export default function SettingsPage() {
  const settingsWidgets = [
    {
      id: 'users',
      name: 'Users',
      description: 'Manage user accounts and permissions',
      icon: <FiUsers className="w-8 h-8" />,
      link: '/admin/settings/users',
      color: 'blue',
    },
    {
      id: 'configuration',
      name: 'Configuration',
      description: 'System-wide configuration settings',
      icon: <FiSettingsIcon className="w-8 h-8" />,
      link: '/admin/settings/configuration',
      color: 'blue',
    },
    {
      id: 'company',
      name: 'School Profile',
      description: 'Update school information and branding',
      icon: <FiBriefcase className="w-8 h-8" />,
      link: '/admin/settings/company-profile',
      color: 'green',
    },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      case 'primary':
        return 'bg-primary-50 text-primary-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsWidgets.map((widget) => (
          <Link 
            key={widget.id} 
            href={widget.link}
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${getColorClass(widget.color)}`}>
                {widget.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{widget.name}</h3>
                <p className="text-sm text-gray-600">{widget.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


