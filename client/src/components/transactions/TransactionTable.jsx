import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Receipt,
} from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function TransactionTable({
  transactions = [],
  userCurrency = 'INR',
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onAddFirst,
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try adjusting your filters or date range, or add a new transaction to record your income and expenses."
          actionLabel="Add Transaction"
          onAction={onAddFirst}
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Title / Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {transactions.map((t) => {
              const isIncome = t.type === 'INCOME';
              return (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                    {t.title}
                    {t.notes && (
                      <span className="block text-xs font-normal text-slate-400 dark:text-slate-500 truncate">
                        {t.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: t.category?.color || '#6366F1' }}
                      />
                      {t.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={isIncome ? 'income' : 'expense'}>
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap capitalize">
                    {t.paymentMethod || 'Cash'}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-bold font-mono whitespace-nowrap ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(t.amount, userCurrency)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(t)}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(t)}
                        title="Edit Transaction"
                        className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(t)}
                        title="Delete Transaction"
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

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((t) => {
          const isIncome = t.type === 'INCOME';
          return (
            <div key={t.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatDate(t.date)} • {t.paymentMethod}
                  </p>
                </div>
                <p
                  className={`text-sm font-bold font-mono flex-shrink-0 ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(t.amount, userCurrency)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isIncome ? 'income' : 'expense'}>
                    {t.type}
                  </Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {t.category?.name || 'Uncategorized'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(t)}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(t)}
                    className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing page <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalCount} total
          transactions)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            {page}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
