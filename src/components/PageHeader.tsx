'use client';

interface PageHeaderAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: PageHeaderAction;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary flex items-center gap-2"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
