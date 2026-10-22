import React from 'react';
import {
  Play,
  Pause,
  Edit2,
  Trash2,
  Calendar,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export default function RecurringTable({
  rules = [],
  userCurrency = 'INR',
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  if (!rules || rules.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={Repeat}
          title="No recurring rules found"
          description="Automate subscriptions, salaries, bills, or rent by setting up your first recurring transaction rule."
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Title / Rule</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Frequency</th>
              <th className="py-3 px-4">Next Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {rules.map((rule) => {
              const isIncome = rule.type === 'INCOME';
              const isActive = rule.isActive;

              return (
                <tr key={rule.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{rule.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{rule.paymentMethod}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: rule.category?.color || '#6366F1' }}
                      />
                      {rule.category?.name || 'Uncategorized'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                      {rule.frequency}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {formatDate(rule.nextExecutionDate)}
                    </div>
                    {rule.endDate && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        Until {formatDate(rule.endDate)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={isActive ? 'income' : 'neutral'}>
                      {isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </td>

                  <td
                    className={`py-3.5 px-4 text-right font-bold font-mono whitespace-nowrap ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(rule.amount, userCurrency)}
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onToggleStatus(rule)}
                        title={isActive ? 'Pause Rule' : 'Resume Rule'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onEdit(rule)}
                        title="Edit Rule"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(rule)}
                        title="Delete Rule"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
