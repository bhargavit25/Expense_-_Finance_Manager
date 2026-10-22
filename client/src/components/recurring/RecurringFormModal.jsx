import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { recurringService } from '../../services/recurringService';
import { categoryService } from '../../services/categoryService';
import { formatDate, getCurrencySymbol } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const FREQUENCIES = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Yearly', value: 'YEARLY' },
];

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Cash',
  'UPI',
  'Check',
  'Other',
];

export default function RecurringFormModal({
  isOpen,
  initialData = null,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.currency || 'INR');

  const [categories, setCategories] = useState([]);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'EXPENSE',
      title: '',
      amount: '',
      categoryId: '',
      frequency: 'MONTHLY',
      startDate: formatDate(new Date(), 'input'),
      endDate: '',
      paymentMethod: 'Bank Transfer',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoadingCats(true);
        const cats = await categoryService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoadingCats(false);
      }
    }
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type,
        title: initialData.title,
        amount: initialData.amount,
        categoryId: initialData.categoryId,
        frequency: initialData.frequency,
        startDate: formatDate(initialData.startDate, 'input'),
        endDate: initialData.endDate ? formatDate(initialData.endDate, 'input') : '',
        paymentMethod: initialData.paymentMethod || 'Bank Transfer',
      });
    } else {
      reset({
        type: 'EXPENSE',
        title: '',
        amount: '',
        categoryId: '',
        frequency: 'MONTHLY',
        startDate: formatDate(new Date(), 'input'),
        endDate: '',
        paymentMethod: 'Bank Transfer',
      });
    }
    setServerError('');
  }, [initialData, isOpen, reset]);

  // Filter categories by selected type
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      const currentCatId = watch('categoryId');
      const matches = filteredCategories.some((c) => c.id === currentCatId);
      if (!matches && !isEditMode) {
        setValue('categoryId', filteredCategories[0].id);
      }
    }
  }, [selectedType, filteredCategories, setValue, watch, isEditMode]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError('');

      const payload = {
        title: data.title.trim(),
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        frequency: data.frequency,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        paymentMethod: data.paymentMethod,
      };

      let result;
      if (isEditMode) {
        result = await recurringService.updateRule(initialData.id, payload);
      } else {
        result = await recurringService.createRule(payload);
      }

      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      setServerError(err.userMessage || 'Failed to save recurring rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Recurring Rule' : 'New Recurring Transaction Rule'}
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
          {/* Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Transaction Flow
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('type', 'EXPENSE')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  selectedType === 'EXPENSE'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 text-rose-700 dark:text-rose-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Expense (Subscription/Bill)
              </button>
              <button
                type="button"
                onClick={() => setValue('type', 'INCOME')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  selectedType === 'INCOME'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Income (Salary/Deposit)
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rule Title / Subscription Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix Subscription, Office Rent, Paycheck"
              {...register('title', { required: 'Title is required' })}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Amount & Frequency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="w-5 text-sm font-bold text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center font-mono">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...register('amount', {
                    required: 'Amount is required',
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recurrence Frequency <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('frequency', { required: 'Frequency is required' })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                disabled={isLoadingCats}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date & End Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Rule' : 'Create Recurring Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
