import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

export default function BudgetVsActualBarChart({ data = [], userCurrency = 'INR' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No budget comparison data found. Set budgets to see actual vs budget analysis.
      </div>
    );
  }

  const symbol = getCurrencySymbol(userCurrency);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs font-medium space-y-1">
          <p className="font-bold text-slate-800 dark:text-white">{label}</p>
          <p className="text-indigo-600 dark:text-indigo-400 flex items-center justify-between gap-4">
            <span>Budget Limit:</span>
            <span className="font-mono font-bold">
              {formatCurrency(payload[0]?.value, userCurrency)}
            </span>
          </p>
          <p className="text-rose-600 dark:text-rose-400 flex items-center justify-between gap-4">
            <span>Actual Spent:</span>
            <span className="font-mono font-bold">
              {formatCurrency(payload[1]?.value, userCurrency)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(val) => `${symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Bar dataKey="budget" name="Budget Limit" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="actual" name="Actual Spent" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
