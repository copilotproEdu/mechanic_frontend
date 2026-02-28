'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'pink' | 'primary';
}

export default function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  const iconBgClasses = {
    blue: 'bg-gray-100',
    green: 'bg-gray-100',
    purple: 'bg-gray-100',
    pink: 'bg-primary-100',
    primary: 'bg-primary-100',
  };

  const iconColorClasses = {
    blue: 'text-gray-700',
    green: 'text-gray-700',
    purple: 'text-gray-700',
    pink: 'text-primary-700',
    primary: 'text-primary-700',
  };

  return (
    <div className="dashboard-card dashboard-card-hover dashboard-card-compact">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center ${iconBgClasses[color]} ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
