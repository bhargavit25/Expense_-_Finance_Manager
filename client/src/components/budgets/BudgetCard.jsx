import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import BudgetProgressBar from './BudgetProgressBar';
import Badge from '../common/Badge';

export default function BudgetCard({
  budget,
  userCurrency = 'INR',
  onEdit,
  onDelete,
}) {
  const {
    category,
    budgetAmount = 0,
    spentAmount = 0,
    remainingAmount = 0,
    usagePercentage = 0,
    status = 'normal',
  } = budget;

  const isOverspent = status === 'overspent';

  const getStatusBadge = () => {
    switch (status) {
      case 'overspent':
        return <Badge variant="danger">Overspent</Badge>;
      case 'critical':
        return <Badge variant="critical">Critical (&gt;90%)</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning (&gt;75%)</Badge>;
      default:
        return <Badge variant="income">On Track</Badge>;
    }
  };

  return (
    <div
      className={`card p-5 card-hover relative flex flex-col justify-between ${
        isOverspent ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-950/40' : ''
      }`}
    >
      <div>
        {/* Category Info & Actions Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm"
              style={{ backgroundColor: category?.color || '#6366F1' }}
            >
              {category?.name?.charAt(0) || 'B'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{category?.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monthly Allocation</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(budget)}
              title="Edit Limit"
              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              title="Delete Budget"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Amount & Usage Status */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(spentAmount, userCurrency)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-1">
              / {formatCurrency(budgetAmount, userCurrency)}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Progress Bar */}
        <div className="my-3">
          <BudgetProgressBar percentage={usagePercentage} status={status} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {formatPercentage(usagePercentage)} used
        </span>
        <span
          className={`font-semibold font-mono ${
            isOverspent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {isOverspent
            ? `Over by ${formatCurrency(Math.abs(remainingAmount), userCurrency)}`
            : `${formatCurrency(remainingAmount, userCurrency)} remaining`}
        </span>
      </div>
    </div>
  );
}
