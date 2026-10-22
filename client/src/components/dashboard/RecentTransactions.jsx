import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function RecentTransactions({ transactions = [], userCurrency = 'INR' }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Recent Transactions</h3>
        <EmptyState
          icon={Receipt}
          title="No recent transactions"
          description="Your transactions for this period will appear here."
        />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest activity across your accounts</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((t) => {
          const isIncome = t.type === 'INCOME';
          return (
            <div key={t.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(t.date, 'short')} • {t.category?.name || 'Uncategorized'}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-bold font-mono ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(t.amount, userCurrency)}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{t.paymentMethod}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
