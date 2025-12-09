import React from 'react';
import { TicketStatus, TicketPriority } from '@/types';

interface BadgeProps {
  variant?: 'status' | 'priority' | 'role' | 'default';
  value: TicketStatus | TicketPriority | string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', value, className = '' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800 border border-blue-200',
      in_progress: 'bg-amber-100 text-amber-800 border border-amber-200',
      resolved: 'bg-green-100 text-green-800 border border-green-200',
      closed: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getPriorityStyles = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'bg-slate-100 text-slate-700 border border-slate-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border border-orange-200',
      urgent: 'bg-red-100 text-red-800 border border-red-200',
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getRoleStyles = (role: string) => {
    const styles: Record<string, string> = {
      client: 'bg-[#B91667]/10 text-[#B91667] border border-[#B91667]/20',
      agent: 'bg-[#3598AE]/10 text-[#3598AE] border border-[#3598AE]/20',
      admin: 'bg-[#411941]/10 text-[#411941] border border-[#411941]/20',
    };
    return styles[role] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getLabel = (value: string) => {
    const labels: Record<string, string> = {
      open: 'Abierto',
      in_progress: 'En Progreso',
      resolved: 'Resuelto',
      closed: 'Cerrado',
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
      client: 'Cliente',
      agent: 'Agente',
      admin: 'Admin',
    };
    return labels[value] || value;
  };

  let variantStyles = '';
  switch (variant) {
    case 'status':
      variantStyles = getStatusStyles(value);
      break;
    case 'priority':
      variantStyles = getPriorityStyles(value);
      break;
    case 'role':
      variantStyles = getRoleStyles(value);
      break;
    default:
      variantStyles = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {getLabel(value)}
    </span>
  );
};

export default Badge;
