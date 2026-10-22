import React from 'react';
import { Search, Download } from 'lucide-react';

export default function TransactionFilters({
  filters,
  categories = [],
  onFilterChange,
  onExportCsv,
  isExporting = false,
}) {
  return (
    <div className="card p-4 space-y-3">
      {/* Top Row: Search & Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions by title or notes..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExportCsv}
          disabled={isExporting}
          className="btn-secondary text-xs sm:text-sm py-2 px-3.5 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Bottom Row: Filters & Sort */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Type Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Type</label>
          <select
            value={filters.type || ''}
            onChange={(e) => onFilterChange({ type: e.target.value || undefined, page: 1 })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" className="bg-white dark:bg-slate-900">All Types</option>
            <option value="EXPENSE" className="bg-white dark:bg-slate-900">Expenses Only</option>
            <option value="INCOME" className="bg-white dark:bg-slate-900">Income Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onFilterChange({ categoryId: e.target.value || undefined, page: 1 })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
          >
            <option value="" className="bg-white dark:bg-slate-900">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">
                {c.name} ({c.type.toLowerCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Sort By</label>
          <select
            value={filters.sortBy || 'date'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value, page: 1 })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date" className="bg-white dark:bg-slate-900">Date</option>
            <option value="amount" className="bg-white dark:bg-slate-900">Amount</option>
            <option value="title" className="bg-white dark:bg-slate-900">Title</option>
            <option value="createdAt" className="bg-white dark:bg-slate-900">Date Added</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Order</label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => onFilterChange({ sortOrder: e.target.value, page: 1 })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="desc" className="bg-white dark:bg-slate-900">Newest / Highest</option>
            <option value="asc" className="bg-white dark:bg-slate-900">Oldest / Lowest</option>
          </select>
        </div>
      </div>
    </div>
  );
}
