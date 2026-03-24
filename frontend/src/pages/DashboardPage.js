import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { expenseService, budgetService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, monthStr } from '../utils/helpers';
import StatCard       from '../components/dashboard/StatCard';
import CategoryChart  from '../components/dashboard/CategoryChart';
import TrendChart     from '../components/dashboard/TrendChart';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import ExpenseCard    from '../components/expenses/ExpenseCard';
import Modal          from '../components/ui/Modal';
import ExpenseForm    from '../components/expenses/ExpenseForm';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary,  setSummary]  = useState(null);
  const [budgets,  setBudgets]  = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editExp,  setEditExp]  = useState(null);
  const [showForm, setShowForm] = useState(false);
  const currency = user?.currency || 'USD';

  const load = async () => {
    try {
      const [sumRes, expRes, budRes] = await Promise.all([
        expenseService.summary(),
        expenseService.getAll({ limit: 5, sortBy: 'date' }),
        budgetService.getAll(monthStr()),
      ]);
      setSummary(sumRes.data.summary);
      setRecent(expRes.data.expenses);
      setBudgets(budRes.data.budgets);
    } catch { toast.error('Failed to load dashboard'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseService.remove(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const handleFormSuccess = () => { setShowForm(false); setEditExp(null); load(); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
    </div>
  );

  const over = budgets.filter(b => b.spent > b.limit);

  return (
    <div className="space-y-6">
      {/* Welcome + CTA */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Here's your financial snapshot</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Expense
        </button>
      </div>

      {/* Budget alerts */}
      {over.length > 0 && (
        <div className="card p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            ⚠️ You've exceeded budget in: {over.map(b => b.category).join(', ')}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="This Month"
          value={formatCurrency(summary?.month?.amount || 0, currency)}
          sub={`${summary?.month?.count || 0} transactions`}
          icon="📅"
          gradient="linear-gradient(135deg,#0ea5e9,#6366f1)"
        />
        <StatCard
          label="This Week"
          value={formatCurrency(summary?.week?.amount || 0, currency)}
          sub={`${summary?.week?.count || 0} transactions`}
          icon="📆"
          gradient="linear-gradient(135deg,#d946ef,#f59e0b)"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(summary?.total?.amount || 0, currency)}
          sub={`${summary?.total?.count || 0} total`}
          icon="💳"
          gradient="linear-gradient(135deg,#10b981,#3b82f6)"
        />
        <StatCard
          label="Monthly Budget"
          value={user?.monthlyBudget ? formatCurrency(user.monthlyBudget, currency) : 'Not set'}
          sub={user?.monthlyBudget ? `${formatCurrency(Math.max(user.monthlyBudget - (summary?.month?.amount||0), 0), currency)} left` : 'Set in Profile'}
          icon="🎯"
          gradient="linear-gradient(135deg,#f43f5e,#f59e0b)"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white mb-4">
            This month by category
          </h3>
          <CategoryChart data={summary?.categoryBreakdown} currency={currency} />
        </div>
        <div className="card p-5">
          <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white mb-4">
            Daily spending (30 days)
          </h3>
          <TrendChart data={summary?.dailyTrend} currency={currency} />
        </div>
      </div>

      {/* Budgets + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">Budgets</h3>
            <Link to="/budgets" className="text-xs text-brand-500 hover:underline">Manage →</Link>
          </div>
          {budgets.length === 0
            ? <p className="text-sm text-slate-400 text-center py-6">No budgets set yet.</p>
            : <div className="space-y-3">{budgets.slice(0, 4).map(b => (
                <BudgetProgress key={b._id} budget={b} currency={currency} />
              ))}</div>
          }
        </div>

        {/* Recent expenses */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">Recent Expenses</h3>
            <Link to="/expenses" className="text-xs text-brand-500 hover:underline">View all →</Link>
          </div>
          {recent.length === 0
            ? <p className="text-sm text-slate-400 text-center py-6">No expenses yet.</p>
            : <div className="space-y-2">{recent.map(e => (
                <ExpenseCard
                  key={e._id} expense={e} currency={currency}
                  onEdit={(exp) => { setEditExp(exp); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              ))}</div>
          }
        </div>
      </div>

      {/* Monthly trend */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white mb-4">
          6-month spending trend
        </h3>
        <TrendChart data={summary?.monthlyTrend} currency={currency} label="Monthly spending" />
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditExp(null); }}
        title={editExp ? 'Edit Expense' : 'New Expense'}
      >
        <ExpenseForm
          expense={editExp}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditExp(null); }}
        />
      </Modal>
    </div>
  );
}
