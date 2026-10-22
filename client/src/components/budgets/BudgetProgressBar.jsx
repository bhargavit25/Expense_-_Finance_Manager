import React from 'react';

export default function BudgetProgressBar({ percentage = 0, status = 'normal' }) {
  const getStatusColor = () => {
    switch (status) {
      case 'overspent':
        return 'bg-rose-600';
      case 'critical':
        return 'bg-orange-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-500';
    }
  };

  const clampedWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
        style={{ width: `${clampedWidth}%` }}
      />
    </div>
  );
}
