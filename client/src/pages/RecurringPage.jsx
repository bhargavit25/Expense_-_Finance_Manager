import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Repeat, Play, CheckCircle2, Clock } from 'lucide-react';
import { recurringService } from '../services/recurringService';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import RecurringTable from '../components/recurring/RecurringTable';
import RecurringFormModal from '../components/recurring/RecurringFormModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function RecurringPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userCurrency = user?.currency || 'INR';

  const loadRules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await recurringService.getRules();
      setRules(data || []);
    } catch (err) {
      console.error('Failed to load recurring rules:', err);
      setError(err.userMessage || 'Could not load recurring transactions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleToggleStatus = async (rule) => {
    try {
      if (rule.isActive) {
        await recurringService.pauseRule(rule.id);
      } else {
        await recurringService.resumeRule(rule.id);
      }
      loadRules();
    } catch (err) {
      alert(err.userMessage || 'Failed to update rule status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRule) return;
    try {
      setIsDeleting(true);
      await recurringService.deleteRule(deletingRule.id);
      setDeletingRule(null);
      loadRules();
    } catch (err) {
      alert(err.userMessage || 'Failed to delete recurring rule.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProcessDueNow = async () => {
    try {
      setIsProcessing(true);
      setProcessMessage('');
      const result = await recurringService.processDue();
      setProcessMessage(
        `Processor executed successfully. ${result.processedCount} transaction(s) generated, ${result.skippedCount} skipped (already executed).`
      );
      loadRules();
    } catch (err) {
      alert(err.userMessage || 'Failed to run recurring transactions processor.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats
  const activeCount = rules.filter((r) => r.isActive).length;
  const activeExpenseCommitment = rules
    .filter((r) => r.isActive && r.type === 'EXPENSE')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const activeIncomeCommitment = rules
    .filter((r) => r.isActive && r.type === 'INCOME')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Recurring Transactions & Automation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automate subscriptions, salaries, rent, and utility bills using node-cron.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleProcessDueNow}
            disabled={isProcessing}
            type="button"
            className="btn-secondary text-xs sm:text-sm font-semibold"
            title="Trigger scheduled processing of due transactions immediately"
          >
            <Play className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isProcessing ? 'Processing...' : 'Run Due Now'}</span>
          </button>

          <button
            onClick={() => {
              setEditingRule(null);
              setIsFormModalOpen(true);
            }}
            type="button"
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {processMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{processMessage}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={loadRules} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Recurring Rules
          </p>
          <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {activeCount}{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">of {rules.length} total</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Processed automatically by scheduler</p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recurring Expenses
          </p>
          <h3 className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(activeExpenseCommitment, userCurrency)}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Scheduled outgoing obligations</p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recurring Income
          </p>
          <h3 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(activeIncomeCommitment, userCurrency)}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Scheduled incoming deposits</p>
        </div>
      </div>

      {/* Rules Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading recurring schedules..." />
      ) : (
        <RecurringTable
          rules={rules}
          userCurrency={userCurrency}
          onEdit={(r) => {
            setEditingRule(r);
            setIsFormModalOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          onDelete={(r) => setDeletingRule(r)}
        />
      )}

      {/* Form Modal */}
      <RecurringFormModal
        isOpen={isFormModalOpen}
        initialData={editingRule}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRule(null);
        }}
        onSuccess={() => loadRules()}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingRule}
        title="Delete Recurring Rule"
        message={`Are you sure you want to delete the recurring rule "${deletingRule?.title}"? Past transactions created by this rule will remain in your history.`}
        confirmText="Delete Rule"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingRule(null)}
      />
    </div>
  );
}
