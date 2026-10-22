import React from 'react';
import { X, Calendar, Tag, CreditCard, FileText, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';

export default function TransactionDetailModal({
  isOpen,
  transaction,
  userCurrency = 'INR',
  onClose,
  onEdit,
  onDelete,
}) {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'INCOME';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header with Amount */}
        <div
          className={`p-6 border-b text-center relative ${
            isIncome
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60'
              : 'bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              isIncome
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
            }`}
          >
            {isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate px-4">{transaction.title}</h3>
          <p
            className={`text-2xl font-black mt-1 font-mono ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount, userCurrency)}
          </p>
          <div className="mt-2">
            <Badge variant={isIncome ? 'income' : 'expense'}>
              {transaction.type}
            </Badge>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 space-y-4 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {/* Category */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Category
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {transaction.category?.name || 'Uncategorized'}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Date
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatDate(transaction.date)}
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Payment Method
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {transaction.paymentMethod || 'Cash'}
            </span>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div className="pt-3">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                Notes
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg whitespace-pre-line border border-slate-100 dark:border-slate-700">
                {transaction.notes}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center justify-between pt-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Recorded At
            </span>
            <span>{formatDate(transaction.createdAt, 'short')}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onDelete) onDelete(transaction);
            }}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300"
          >
            Delete Transaction
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(transaction);
              }}
              className="btn-primary text-xs py-1.5 px-3.5"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
