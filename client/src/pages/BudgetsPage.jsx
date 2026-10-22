import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, PieChart, AlertCircle } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatMonthYear, formatPercentage } from '../utils/formatters';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetFormModal from '../components/budgets/BudgetFormModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

export default function BudgetsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userCurrency = user?.currency || 'INR';

  const loadBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await budgetService.getBudgets(selectedMonth, selectedYear);
      setBudgets(data.budgets || []);
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setError(err.userMessage || 'Could not load budget data.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Month stepping helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBudget) return;
    try {
      setIsDeleting(true);
      await budgetService.deleteBudget(deletingBudget.id);
      setDeletingBudget(null);
      loadBudgets();
    } catch (err) {
      alert(err.userMessage || 'Failed to delete budget.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Aggregate stats
  const totalAllocated = budgets.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const overallUsage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const overspentCount = budgets.filter((b) => b.status === 'overspent').length;

  return (
    <div className="space-y-6">
      {/* Header with Month Navigator & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Set category limits and track actual spending against monthly goals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Step Controls */}
          <div className="flex items-center bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
              {formatMonthYear(selectedMonth, selectedYear)}
            </span>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsFormModalOpen(true);
            }}
            type="button"
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadBudgets} />}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Allocated Budget
          </p>
          <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalAllocated, userCurrency)}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Across {budgets.length} categories</p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Actual Spent
          </p>
          <h3 className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(totalSpent, userCurrency)}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatPercentage(overallUsage)} of limit used</p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Remaining Capacity
          </p>
          <h3
            className={`text-2xl font-bold font-mono mt-2 ${
              totalSpent > totalAllocated ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatCurrency(totalRemaining, userCurrency)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {overspentCount > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {overspentCount} category(s) overspent
              </span>
            ) : (
              'All categories within limits'
            )}
          </p>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading budget allocations..." />
      ) : budgets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={PieChart}
            title="No budgets set for this month"
            description={`Set category limits for ${formatMonthYear(
              selectedMonth,
              selectedYear
            )} to stay on track and prevent overspending.`}
            actionLabel="Allocate First Budget"
            onAction={() => {
              setEditingBudget(null);
              setIsFormModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              userCurrency={userCurrency}
              onEdit={(budget) => {
                setEditingBudget(budget);
                setIsFormModalOpen(true);
              }}
              onDelete={(budget) => setDeletingBudget(budget)}
            />
          ))}
        </div>
      )}

      {/* Set/Edit Budget Modal */}
      <BudgetFormModal
        isOpen={isFormModalOpen}
        initialData={editingBudget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        existingBudgetCategoryIds={budgets.map((b) => b.categoryId)}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={() => loadBudgets()}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingBudget}
        title="Remove Budget Allocation"
        message={`Are you sure you want to remove the monthly budget for "${deletingBudget?.category?.name}"? Spending records will not be deleted.`}
        confirmText="Remove Budget"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingBudget(null)}
      />
    </div>
  );
}
