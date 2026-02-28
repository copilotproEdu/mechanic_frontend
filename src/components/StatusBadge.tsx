'use client';

import { OrderStatus, InvoiceStatus, PackageStatus } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus | InvoiceStatus | PackageStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClass = () => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'draft':
      case 'not-shipped':
        return 'badge-draft';
      case 'confirmed':
      case 'sent':
        return 'badge-confirmed';
      case 'completed':
      case 'paid':
      case 'delivered':
        return 'badge-completed';
      case 'shipped':
        return 'badge-shipped';
      case 'overdue':
      case 'void':
        return 'badge-overdue';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-pink-100 text-pink-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`badge ${getStatusClass()}`}>
      {status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
}
