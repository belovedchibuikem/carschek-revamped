import React from 'react';

type StatusType = 'new' | 'assigned' | 'in-progress' | 'reported' | 'qa-review' | 'closed' | 'cancelled' | 'active' | 'flagged' | 'suspended' | 'available' | 'busy' | 'off-duty' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  'new': { label: 'New', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  'assigned': { label: 'Assigned', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  'in-progress': { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'reported': { label: 'Reported', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  'qa-review': { label: 'QA Review', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  'closed': { label: 'Closed', className: 'bg-green-50 text-green-700 border-green-200' },
  'cancelled': { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
  'active': { label: 'Active', className: 'bg-green-50 text-green-700 border-green-200' },
  'flagged': { label: 'Flagged', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'suspended': { label: 'Suspended', className: 'bg-red-50 text-red-700 border-red-200' },
  'available': { label: 'Available', className: 'bg-green-50 text-green-700 border-green-200' },
  'busy': { label: 'On Job', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'off-duty': { label: 'Off Duty', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  'pending': { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'approved': { label: 'Approved', className: 'bg-green-50 text-green-700 border-green-200' },
  'rejected': { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
};

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center border font-medium rounded-full ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} ${config.className}`}>
      {config.label}
    </span>
  );
}