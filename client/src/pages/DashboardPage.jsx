import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  PiggyBank,
  PieChart as PieIcon,
  Receipt,
  Wallet,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import SummaryCard from '../components/dashboard/SummaryCard';
import DateRangeFilter from '../components/dashboard/DateRangeFilter';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetWarningsList from '../components/dashboard/BudgetWarningsList';
import IncomeExpenseBarChart from '../charts/IncomeExpenseBarChart';
import ExpenseBreakdownPieChart from '../charts/ExpenseBreakdownPieChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [summaryData, setSummaryData] = useState(null);
  const [incomeExpenseTrend, setIncomeExpenseTrend] = useState([]);
  const [breakdownData, setBreakdownData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const userCurrency = user?.currency || 'INR';

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = {
        period,
        ...(period === 'custom' && customStart && { startDate: customStart }),
        ...(period === 'custom' && customEnd && { endDate: customEnd }),
      };

      const [summary, trend, breakdown] = await Promise.all([
        analyticsService.getSummary(params),
        analyticsService.getIncomeVsExpenses(6),
        analyticsService.getExpenseBreakdown(params),
      ]);

      setSummaryData(summary);
      setIncomeExpenseTrend(trend);
      setBreakdownData(breakdown.breakdown || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.userMessage || 'Could not load dashboard information.');
    } finally {
      setIsLoading(false);
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Listen for global transaction create events to refresh dashboard
  useEffect(() => {
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('financeflow_transaction_created', handleRefresh);
    return () => window.removeEventListener('financeflow_transaction_created', handleRefresh);
  }, [loadDashboardData]);

  if (isLoading && !summaryData) {
    return <LoadingSpinner size="lg" text="Loading financial metrics..." />;
  }

  const summary = summaryData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Top Header: Title & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time cashflow, periodic savings, and budget health overview.
          </p>
        </div>

        <DateRangeFilter
          selectedPeriod={period}
          onPeriodChange={setPeriod}
          customStart={customStart}
          customEnd={customEnd}
          onCustomDateChange={(start, end) => {
            setCustomStart(start);
            setCustomEnd(end);
          }}
        />
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

      {/* Lifetime Balance Banner vs Current Period Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-indigo-950/80 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4 text-indigo-400" />
            Lifetime Account Net Worth
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
            {formatCurrency(summary.lifetimeBalance || 0, userCurrency)}
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Cumulative total of all historical income minus all historical expenses.
          </p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-xs text-indigo-200 font-medium">Selected Period Cashflow</p>
            <p
              className={`text-xl sm:text-2xl font-bold font-mono mt-0.5 ${
                (summary.netPeriodCashflow || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(summary.netPeriodCashflow || 0) >= 0 ? '+' : ''}
              {formatCurrency(summary.netPeriodCashflow || 0, userCurrency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-indigo-200 font-medium">Savings Rate</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
              {formatPercentage(summary.savingsRate || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={formatCurrency(summary.totalIncome || 0, userCurrency)}
          subtitle="Selected period receipts"
          icon={TrendingUp}
          variant="income"
        />

        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses || 0, userCurrency)}
          subtitle="Selected period spending"
          icon={TrendingDown}
          variant="expense"
        />

        <SummaryCard
          title="Net Period Balance"
          value={formatCurrency(summary.netPeriodCashflow || 0, userCurrency)}
          subtitle="Income minus expenses"
          icon={Coins}
          variant={summary.netPeriodCashflow >= 0 ? 'balance' : 'expense'}
        />

        <SummaryCard
          title="Budget Utilization"
          value={formatPercentage(summary.budgetUtilization || 0)}
          subtitle={`${summary.transactionCount || 0} transactions recorded`}
          icon={PieIcon}
          variant={summary.budgetUtilization > 90 ? 'expense' : 'savings'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart (2 columns) */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Income vs Expenses (6-Month Trend)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparing periodic income against overall expenses</p>
            </div>
          </div>
          <IncomeExpenseBarChart data={incomeExpenseTrend} userCurrency={userCurrency} />
        </div>

        {/* Expense Breakdown Donut Chart (1 column) */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expense Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Category allocation for this period</p>
            </div>
          </div>
          <ExpenseBreakdownPieChart data={breakdownData} userCurrency={userCurrency} />
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Budget Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={summaryData?.recentTransactions}
            userCurrency={userCurrency}
          />
        </div>

        <div>
          <BudgetWarningsList
            warnings={summaryData?.budgetWarnings}
            userCurrency={userCurrency}
          />
        </div>
      </div>
    </div>
  );
}
