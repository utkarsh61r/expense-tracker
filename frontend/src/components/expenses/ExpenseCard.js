import React from 'react';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/helpers';

export default function ExpenseCard({ expense, onEdit, onDelete, currency }) {
  const color = CATEGORY_COLORS[expense.category] || '#94a3b8';
  const icon  = CATEGORY_ICONS[expense.category]  || '📦';

  return (
    <div className="card-hover p-4 flex items-center gap-4 group">
      {/* Category icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: color + '20' }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{expense.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="badge text-xs"
            style={{ backgroundColor: color + '20', color }}
          >
            {expense.category}
          </span>
          <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
          {expense.paymentMethod && expense.paymentMethod !== 'Other' && (
            <span className="text-xs text-slate-400">· {expense.paymentMethod}</span>
          )}
        </div>
        {expense.notes && (
          <p className="text-xs text-slate-400 mt-1 truncate">{expense.notes}</p>
        )}
      </div>

      {/* Amount + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
          {formatCurrency(expense.amount, currency)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(expense)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-500 text-sm"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(expense._id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
