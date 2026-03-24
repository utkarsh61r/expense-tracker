import React from 'react';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/helpers';

export default function BudgetProgress({ budget, currency }) {
  const pct   = Math.min((budget.spent / budget.limit) * 100, 100);
  const over  = budget.spent > budget.limit;
  const color = over ? '#ef4444' : pct > 80 ? '#f59e0b' : CATEGORY_COLORS[budget.category] || '#0ea5e9';
  const icon  = CATEGORY_ICONS[budget.category] || '📦';

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{budget.category}</span>
        </div>
        {over && (
          <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs">
            Over budget!
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          <span className="font-medium" style={{ color }}>{formatCurrency(budget.spent, currency)}</span>
          {' '}spent
        </span>
        <span>Limit: {formatCurrency(budget.limit, currency)}</span>
      </div>
    </div>
  );
}
