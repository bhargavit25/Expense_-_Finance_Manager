import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { formatDate, getCurrencySymbol } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI',
  'Check',
  'Other',
];

export default function TransactionFormModal({
  isOpen,
  initialData = null,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.currency || 'INR');

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
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
      date: formatDate(new Date(), 'input'),
      paymentMethod: 'Cash',
      notes: '',
    },
  });

  const selectedType = watch('type');

  // Load categories
  useEffect(() => {
    async function fetchCats() {
      try {
        setIsLoadingCategories(true);
        const cats = await categoryService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    if (isOpen) {
      fetchCats();
    }
  }, [isOpen]);

  // Populate form on edit
  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type,
        title: initialData.title,
        amount: initialData.amount,
        categoryId: initialData.categoryId,
        date: formatDate(initialData.date, 'input'),
        paymentMethod: initialData.paymentMethod || 'Cash',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        type: 'EXPENSE',
        title: '',
        amount: '',
        categoryId: '',
        date: formatDate(new Date(), 'input'),
        paymentMethod: 'Cash',
        notes: '',
      });
    }
    setServerError('');
  }, [initialData, isOpen, reset]);

  // Filter categories by selected type
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  // Set default category when type changes if current category doesn't match
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
        date: new Date(data.date).toISOString(),
        paymentMethod: data.paymentMethod,
        notes: data.notes ? data.notes.trim() : null,
      };

      let result;
      if (isEditMode) {
        result = await transactionService.updateTransaction(initialData.id, payload);
      } else {
        result = await transactionService.createTransaction(payload);
      }

      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      setServerError(err.userMessage || 'Failed to save transaction.');
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
            {isEditMode ? 'Edit Transaction' : 'Record New Transaction'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
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
              Transaction Type
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
                Expense
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
                Income
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Salary, Groceries, Internet Bill"
              {...register('title', { required: 'Title is required' })}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                })}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  errors.amount ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {errors.amount && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {errors.date && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                disabled={isLoadingCategories}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  errors.categoryId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                {filteredCategories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  filteredCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {c.name}
                    </option>
                  ))
                )}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.categoryId.message}</p>
              )}
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Add additional details or reference numbers..."
              {...register('notes')}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
