import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../hooks/useAuth';
import { downloadCsv } from '../utils/exportCsv';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionFormModal from '../components/transactions/TransactionFormModal';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: undefined,
    categoryId: undefined,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userCurrency = user?.currency || 'INR';

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch transactions
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await transactionService.getTransactions(filters);
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, totalCount: 0 });
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err.userMessage || 'Could not load transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const csvData = await transactionService.exportCsv(filters);
      downloadCsv(csvData, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export CSV file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    try {
      setIsDeleting(true);
      await transactionService.deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
      loadTransactions();
    } catch (err) {
      alert(err.userMessage || 'Failed to delete transaction.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View, filter, search, and export your entire financial history.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsFormModalOpen(true);
          }}
          type="button"
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadTransactions} />}

      {/* Filters Bar */}
      <TransactionFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
      />

      {/* Table / List */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading transactions ledger..." />
      ) : (
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          userCurrency={userCurrency}
          onPageChange={(page) => handleFilterChange({ page })}
          onView={(t) => setViewingTransaction(t)}
          onEdit={(t) => {
            setEditingTransaction(t);
            setIsFormModalOpen(true);
          }}
          onDelete={(t) => setDeletingTransaction(t)}
        />
      )}

      {/* Modals */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        initialData={editingTransaction}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => loadTransactions()}
      />

      <TransactionDetailModal
        isOpen={!!viewingTransaction}
        transaction={viewingTransaction}
        userCurrency={userCurrency}
        onClose={() => setViewingTransaction(null)}
        onEdit={(t) => {
          setViewingTransaction(null);
          setEditingTransaction(t);
          setIsFormModalOpen(true);
        }}
        onDelete={(t) => {
          setViewingTransaction(null);
          setDeletingTransaction(t);
        }}
      />

      <ConfirmationModal
        isOpen={!!deletingTransaction}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deletingTransaction?.title}"? This will permanently remove the record and adjust your budget and analytics.`}
        confirmText="Delete Transaction"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingTransaction(null)}
      />
    </div>
  );
}
