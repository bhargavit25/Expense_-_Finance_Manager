import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const FILTER_OPTIONS = [
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom Range', value: 'custom' },
];

export default function DateRangeFilter({
  selectedPeriod,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomDateChange,
}) {
  const [showCustomInputs, setShowCustomInputs] = useState(selectedPeriod === 'custom');

  const handleSelectChange = (e) => {
    const val = e.target.value;
    onPeriodChange(val);
    setShowCustomInputs(val === 'custom');
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="relative">
        <select
          value={selectedPeriod}
          onChange={handleSelectChange}
          className="appearance-none bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium py-2 pl-9 pr-8 rounded-lg shadow-sm hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {showCustomInputs && (
        <div className="flex items-center gap-2 animate-fade-in">
          <input
            type="date"
            value={customStart || ''}
            onChange={(e) => onCustomDateChange(e.target.value, customEnd)}
            className="text-xs bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customEnd || ''}
            onChange={(e) => onCustomDateChange(customStart, e.target.value)}
            className="text-xs bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
