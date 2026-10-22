import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';

export default function ReassignCategoryModal({
  isOpen,
  categoryToDelete,
  availableCategories = [],
  dependencyDetails,
  onClose,
  onSuccess,
}) {
  const [selectedReplacementId, setSelectedReplacementId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !categoryToDelete) return null;

  // Filter out the category itself and keep only same type
  const validReplacements = availableCategories.filter(
    (c) => c.id !== categoryToDelete.id && c.type === categoryToDelete.type
  );

  const handleConfirmReassign = async () => {
    if (!selectedReplacementId) {
      setError('Please select a replacement category.');
      return;
    }

    try {
      setIsDeleting(true);
      setError('');
      await categoryService.deleteCategory(categoryToDelete.id, selectedReplacementId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Failed to reassign and delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Category in Use</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The category <span className="font-bold text-slate-900 dark:text-white">"{categoryToDelete.name}"</span> is
            currently associated with existing records:
          </p>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1 font-medium">
            <p>• {dependencyDetails?.txCount || 0} transaction(s)</p>
            <p>• {dependencyDetails?.budgetCount || 0} monthly budget allocation(s)</p>
            <p>• {dependencyDetails?.recurringCount || 0} automated recurring rule(s)</p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            To preserve accurate financial reports, select a replacement{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{categoryToDelete.type.toLowerCase()}</span> category to
            receive these records before deletion.
          </p>

          {/* Replacement Category Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Replacement Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedReplacementId}
              onChange={(e) => setSelectedReplacementId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Choose replacement category...</option>
              {validReplacements.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReassign}
            disabled={isDeleting || !selectedReplacementId}
            className="btn-danger"
          >
            {isDeleting ? 'Reassigning...' : 'Reassign & Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
