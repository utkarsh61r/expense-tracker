import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/expenses':  'Expenses',
  '/budgets':   'Budgets',
  '/profile':   'Profile',
};

export default function Topbar({ onMenuClick }) {
  const { dark, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Spendwise';

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          ☰
        </button>
        <h2 className="font-display font-semibold text-lg text-slate-800 dark:text-white">{title}</h2>
      </div>

      {/* Right: theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all text-lg"
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </header>
  );
}
