import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/categoryService';
import { getCurrencySymbol } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export default function BudgetFormModal({
  isOpen,
  initialData = null,
  selectedMonth,
  selectedYear,
  existingBudgetCategoryIds = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.currency || 'INR');

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryId: '',
      amount: '',
      month: selectedMonth || new Date().getMonth() + 1,
      year: selectedYear || new Date().getFullYear(),
    },
  });

  useEffect(() => {
    async function loadExpenseCategories() {
      try {
        setIsLoading(true);
        const allCats = await categoryService.getCategories();
        setCategories(allCats.filter((c) => c.type === 'EXPENSE'));
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      loadExpenseCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      reset({
        categoryId: initialData.categoryId,
        amount: initialData.budgetAmount || initialData.amount,
        month: initialData.month,
        year: initialData.year,
      });
    } else {
      reset({
        categoryId: '',
        amount: '',
        month: selectedMonth || new Date().getMonth() + 1,
        year: selectedYear || new Date().getFullYear(),
      });
    }
    setServerError('');
  }, [initialData, isOpen, selectedMonth, selectedYear, reset]);

  if (!isOpen) return null;

  // Filter out categories that already have a budget this month, unless in edit mode
  const availableCategories = isEditMode
    ? categories
    : categories.filter((c) => !existingBudgetCategoryIds.includes(c.id));

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError('');

      let result;
      if (isEditMode) {
        result = await budgetService.updateBudget(initialData.id, parseFloat(data.amount));
      } else {
        result = await budgetService.setBudget({
          categoryId: data.categoryId,
          amount: parseFloat(data.amount),
          month: parseInt(data.month, 10),
          year: parseInt(data.year, 10),
        });
      }

      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      setServerError(err.userMessage || 'Failed to save budget allocation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Monthly Budget' : 'Set Category Budget'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs rounded-lg font-medium">
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expense Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('categoryId', { required: 'Please select an expense category' })}
              disabled={isEditMode || isLoading}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.categoryId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <option value="">Select a category...</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.categoryId.message}</p>
            )}
            {!isEditMode && availableCategories.length === 0 && !isLoading && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                All existing expense categories already have budgets allocated for this month.
              </p>
            )}
          </div>

          {/* Budget Limit Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Limit Amount ({currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="w-5 text-sm font-bold text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center font-mono">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="5000.00"
                {...register('amount', {
                  required: 'Budget amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than zero' },
                })}
                className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  errors.amount ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Hidden/Readonly Month & Year */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Month</label>
              <input
                type="number"
                readOnly
                {...register('month')}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Year</label>
              <input
                type="number"
                readOnly
                {...register('year')}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isEditMode && availableCategories.length === 0)}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Budget' : 'Allocate Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
