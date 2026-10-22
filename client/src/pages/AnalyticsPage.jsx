import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import DateRangeFilter from '../components/dashboard/DateRangeFilter';
import IncomeExpenseBarChart from '../charts/IncomeExpenseBarChart';
import ExpenseBreakdownPieChart from '../charts/ExpenseBreakdownPieChart';
import MonthlySpendingTrendChart from '../charts/MonthlySpendingTrendChart';
import CategoryComparisonBarChart from '../charts/CategoryComparisonBarChart';
import BudgetVsActualBarChart from '../charts/BudgetVsActualBarChart';
import SavingsTrendChart from '../charts/SavingsTrendChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [monthsCount, setMonthsCount] = useState(6);

  const [incomeExpenseData, setIncomeExpenseData] = useState([]);
  const [breakdownData, setBreakdownData] = useState([]);
  const [spendingTrendData, setSpendingTrendData] = useState([]);
  const [categoryComparisonData, setCategoryComparisonData] = useState([]);
  const [budgetVsActualData, setBudgetVsActualData] = useState([]);
  const [savingsTrendData, setSavingsTrendData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const userCurrency = user?.currency || 'INR';

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const periodParams = {
        period,
        ...(period === 'custom' && customStart && { startDate: customStart }),
        ...(period === 'custom' && customEnd && { endDate: customEnd }),
      };

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [
        incExp,
        breakdown,
        trend,
        catComp,
        budgetComp,
        savings,
      ] = await Promise.all([
        analyticsService.getIncomeExpenseTrend(monthsCount),
        analyticsService.getCategoryBreakdown(periodParams),
        analyticsService.getSpendingTrend(monthsCount),
        analyticsService.getCategoryComparison(periodParams),
        analyticsService.getBudgetVsActual(currentMonth, currentYear),
        analyticsService.getSavingsTrend(monthsCount),
      ]);

      setIncomeExpenseData(incExp || []);
      setBreakdownData(breakdown || []);
      setSpendingTrendData(trend || []);
      setCategoryComparisonData(catComp || []);
      setBudgetVsActualData(budgetComp || []);
      setSavingsTrendData(savings || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.userMessage || 'Could not load analytics charts.');
    } finally {
      setIsLoading(false);
    }
  }, [period, customStart, customEnd, monthsCount]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deep dive into spending patterns, historical cashflow, and category performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Months Range Selector */}
          <div className="flex items-center bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setMonthsCount(6)}
              className={`px-3 py-1 rounded-md transition-colors ${
                monthsCount === 6 ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setMonthsCount(12)}
              className={`px-3 py-1 rounded-md transition-colors ${
                monthsCount === 12 ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              12 Months
            </button>
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
      </div>

      {error && <ErrorMessage message={error} onRetry={loadAnalytics} />}

      {isLoading ? (
        <LoadingSpinner size="lg" text="Aggregating financial charts..." />
      ) : (
        <div className="space-y-6">
          {/* Row 1: Income vs Expenses & Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-5 lg:col-span-2">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Income vs. Expenses ({monthsCount} Months)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monthly cashflow comparison showing earned income versus total expenses
                </p>
              </div>
              <IncomeExpenseBarChart data={incomeExpenseData} userCurrency={userCurrency} />
            </div>

            <div className="card p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Expense Breakdown</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Selected period category distribution</p>
              </div>
              <ExpenseBreakdownPieChart data={breakdownData} userCurrency={userCurrency} />
            </div>
          </div>

          {/* Row 2: Monthly Spending Trend & Category Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  3. Monthly Spending Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Expense velocity over time</p>
              </div>
              <MonthlySpendingTrendChart data={spendingTrendData} userCurrency={userCurrency} />
            </div>

            <div className="card p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Category Comparison</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total spending compared across categories</p>
              </div>
              <CategoryComparisonBarChart
                data={categoryComparisonData}
                userCurrency={userCurrency}
              />
            </div>
          </div>

          {/* Row 3: Budget vs Actual & Monthly Savings Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">5. Budget vs. Actual</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comparing current month category budget limits with actual spending
                </p>
              </div>
              <BudgetVsActualBarChart data={budgetVsActualData} userCurrency={userCurrency} />
            </div>

            <div className="card p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  6. Monthly Net Savings Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Net period accumulation (income minus expenses)
                </p>
              </div>
              <SavingsTrendChart data={savingsTrendData} userCurrency={userCurrency} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
