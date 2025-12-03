import React from 'react';
import { Issue } from '../../types';

interface StatusBadgeProps {
  status: Issue['status'];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    submitted: {
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      text: 'Submitted'
    },
    verified: {
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      text: 'Community Verified'
    },
    acknowledged: {
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      text: 'Acknowledged'
    },
    'in-progress': {
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      text: 'In Progress'
    },
    'pending-confirmation': {
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      text: 'Pending Confirmation'
    },
    resolved: {
      color: 'bg-green-500/20 text-green-300 border-green-500/30',
      text: 'Resolved'
    },
    rejected: {
      color: 'bg-red-500/20 text-red-300 border-red-500/30',
      text: 'Rejected'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.text}
    </span>
  );
};