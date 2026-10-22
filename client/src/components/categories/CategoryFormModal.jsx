import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { categoryService } from '../../services/categoryService';

const PRESET_COLORS = [
  '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6',
  '#10B981', '#84CC16', '#EAB308', '#F97316', '#EF4444',
  '#EC4899', '#8B5CF6', '#64748B', '#1E293B',
];

export default function CategoryFormModal({
  isOpen,
  initialData = null,
  onClose,
  onSuccess,
}) {
  const [selectedColor, setSelectedColor] = useState('#6366F1');
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
      name: '',
      type: 'EXPENSE',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
      });
      setSelectedColor(initialData.color || '#6366F1');
    } else {
      reset({
        name: '',
        type: 'EXPENSE',
      });
      setSelectedColor('#6366F1');
    }
    setServerError('');
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError('');

      const payload = {
        name: data.name.trim(),
        type: data.type,
        color: selectedColor,
      };

      let result;
      if (isEditMode) {
        result = await categoryService.updateCategory(initialData.id, payload);
      } else {
        result = await categoryService.createCategory(payload);
      }

      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      setServerError(err.userMessage || 'Failed to save category.');
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
            {isEditMode ? 'Edit Custom Category' : 'Create Custom Category'}
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
          {!isEditMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('type', 'EXPENSE')}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
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
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
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
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Pet Care, Software Subscriptions"
              {...register('name', { required: 'Category name is required' })}
              className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Color Picker Swatches */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Tag
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
