import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tags, Edit2, Trash2, Lock, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import ReassignCategoryModal from '../components/categories/ReassignCategoryModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Badge from '../components/common/Badge';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('EXPENSE');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [reassignCategory, setReassignCategory] = useState(null);
  const [reassignDetails, setReassignDetails] = useState(null);
  const [isDeletingDirect, setIsDeletingDirect] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.userMessage || 'Could not load categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleDeleteClick = async (category) => {
    // Attempt deletion
    try {
      await categoryService.deleteCategory(category.id);
      loadCategories();
    } catch (err) {
      if (err.response?.data?.code === 'CATEGORY_HAS_DEPENDENCIES') {
        // Must show reassignment modal!
        setReassignCategory(category);
        setReassignDetails(err.response.data.details);
      } else {
        alert(err.userMessage || 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Categories Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize transactions and budgets with default and custom categories.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsFormModalOpen(true);
          }}
          type="button"
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadCategories} />}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'EXPENSE'
              ? 'border-rose-600 text-rose-700 dark:text-rose-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          Expense Categories (
          {categories.filter((c) => c.type === 'EXPENSE').length}
          )
        </button>

        <button
          onClick={() => setActiveTab('INCOME')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'INCOME'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Income Categories (
          {categories.filter((c) => c.type === 'INCOME').length}
          )
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((c) => {
            const isSystem = c.isDefault || !c.userId;
            return (
              <div
                key={c.id}
                className="card p-4 card-hover flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm flex-shrink-0"
                    style={{ backgroundColor: c.color || '#6366F1' }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{c.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isSystem ? (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                          System Default
                        </span>
                      ) : (
                        <Badge variant="primary" size="sm">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {!isSystem && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setIsFormModalOpen(true);
                      }}
                      title="Edit Category"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(c)}
                      title="Delete Category"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        initialData={editingCategory}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={() => loadCategories()}
      />

      {/* Reassign Category Modal */}
      <ReassignCategoryModal
        isOpen={!!reassignCategory}
        categoryToDelete={reassignCategory}
        availableCategories={categories}
        dependencyDetails={reassignDetails}
        onClose={() => {
          setReassignCategory(null);
          setReassignDetails(null);
        }}
        onSuccess={() => loadCategories()}
      />
    </div>
  );
}
