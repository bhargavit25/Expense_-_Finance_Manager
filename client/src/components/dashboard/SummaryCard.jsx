import React from 'react';

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  trend,
}) {
  const variantStyles = {
    income: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    expense: {
      bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    balance: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-slate-900 dark:text-white',
    },
    savings: {
      bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-700 dark:text-blue-400',
    },
    neutral: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      valueColor: 'text-slate-900 dark:text-white',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <div className="card p-5 card-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className={`text-2xl font-bold tracking-tight font-mono ${style.valueColor}`}>{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
