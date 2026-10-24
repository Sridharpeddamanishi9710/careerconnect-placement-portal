import React from 'react';

export default function StatusBadge({ status, type = 'application' }) {
  if (!status) return null;

  // Status configs for applications
  const appStyles = {
    APPLIED: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Applied',
      dot: 'bg-blue-500',
    },
    SHORTLISTED: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Shortlisted',
      dot: 'bg-amber-500',
    },
    TECHNICAL_ROUND: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      label: 'Technical Round',
      dot: 'bg-purple-500',
    },
    HR_ROUND: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      label: 'HR Round',
      dot: 'bg-indigo-500',
    },
    SELECTED: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Selected',
      dot: 'bg-emerald-500',
    },
    REJECTED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Rejected',
      dot: 'bg-rose-500',
    },
  };

  // Status configs for drives
  const driveStyles = {
    UPCOMING: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      label: 'Upcoming',
      dot: 'bg-sky-500',
    },
    ONGOING: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Active / Ongoing',
      dot: 'bg-emerald-500 animate-pulse',
    },
    COMPLETED: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'Completed',
      dot: 'bg-slate-400',
    },
    CANCELLED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Cancelled',
      dot: 'bg-rose-500',
    },
  };

  const config = type === 'drive' 
    ? (driveStyles[status] || driveStyles.UPCOMING)
    : (appStyles[status] || appStyles.APPLIED);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
