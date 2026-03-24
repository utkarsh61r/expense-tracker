import React from 'react';

export default function StatCard({ label, value, sub, icon, gradient }) {
  return (
    <div className="stat-card relative overflow-hidden">
      {/* Background gradient blob */}
      {gradient && (
        <div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl"
          style={{ background: gradient }}
        />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="text-2xl">{icon}</div>
        )}
      </div>
    </div>
  );
}
