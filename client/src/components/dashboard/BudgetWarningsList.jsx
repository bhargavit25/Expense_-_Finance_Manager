import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export default function BudgetWarningsList({ warnings = [], userCurrency = 'INR' }) {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Budget Health</h3>
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">All budgets on track</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">None of your active monthly budgets exceed 75% utilization.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Budget Warnings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Categories requiring attention this month</p>
        </div>
        <Link
          to="/budgets"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
        >
          Manage
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {warnings.map((w) => {
          const isOverspent = w.isOverspent;
          return (
            <div
              key={w.categoryId}
              className={`p-3 rounded-xl border transition-all ${
                isOverspent
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                  : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {isOverspent ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  )}
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{w.categoryName}</span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    isOverspent ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {formatPercentage(w.usagePercentage)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverspent ? 'bg-rose-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, w.usagePercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Spent: {formatCurrency(w.spentAmount, userCurrency)}</span>
                <span>Limit: {formatCurrency(w.budgetAmount, userCurrency)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
