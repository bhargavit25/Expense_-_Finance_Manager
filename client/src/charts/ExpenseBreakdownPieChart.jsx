import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const DEFAULT_COLORS = [
  '#6366F1', '#EC4899', '#F97316', '#10B981', '#0EA5E9',
  '#8B5CF6', '#F59E0B', '#14B8A6', '#EF4444', '#64748B',
];

export default function ExpenseBreakdownPieChart({ data = [], userCurrency = 'INR' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No expense data recorded for this period.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs font-medium space-y-1">
          <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </p>
          <p className="text-slate-600 dark:text-slate-300 font-mono font-bold">
            {formatCurrency(item.value, userCurrency)} ({formatPercentage(item.percentage)})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: '8px', fontSize: '11px', maxHeight: '50px', overflowY: 'auto' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
