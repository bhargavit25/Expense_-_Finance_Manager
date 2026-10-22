import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  Check,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications();
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case 'BUDGET_EXCEEDED':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'BUDGET_WARNING':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Notifications & Alerts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deduplicated budget thresholds and system alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            type="button"
            className="btn-secondary text-xs font-semibold py-1.5 px-3"
          >
            <CheckCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filter === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filter === 'UNREAD'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title={filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
            description="You will receive alerts here when your category spending reaches 75%, 90%, or 100% of your budget."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`card p-4 card-hover flex items-start justify-between gap-4 transition-all ${
                !n.isRead ? 'border-l-4 border-l-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {getAlertIcon(n.type)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{n.title}</h3>
                    {n.threshold && (
                      <Badge
                        variant={
                          n.threshold > 100
                            ? 'danger'
                            : n.threshold >= 90
                            ? 'critical'
                            : 'warning'
                        }
                      >
                        {n.threshold > 100 ? '>100% Limit' : `${n.threshold}% Threshold`}
                      </Badge>
                    )}
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(n.createdAt)}</span>
                    {n.category && (
                      <>
                        <span>•</span>
                        <span>Category: {n.category.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
