import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { budgetService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, formatCurrency, monthStr } from '../utils/helpers';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import Modal from '../components/ui/Modal';
import { format, addMonths, subMonths } from 'date-fns';

export default function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [budgets,   setBudgets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [month,     setMonth]     = useState(monthStr());
  const [form,      setForm]      = useState({ category: '', limit: '' });
  const [saving,    setSaving]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await budgetService.getAll(month);
      setBudgets(res.data.budgets);
    } catch { toast.error('Failed to load budgets'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [month]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await budgetService.set({ ...form, limit: parseFloat(form.limit), month });
      toast.success('Budget saved!');
      setShowForm(false);
      setForm({ category: '', limit: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget?')) return;
    try { await budgetService.remove(id); toast.success('Budget removed'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const prevMonth = () => setMonth(monthStr(subMonths(new Date(month + '-01'), 1)));
  const nextMonth = () => setMonth(monthStr(addMonths(new Date(month + '-01'), 1)));
  const displayMonth = format(new Date(month + '-01'), 'MMMM yyyy');

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Budgets</h2>
          <p className="text-sm text-slate-500">Set spending limits per category</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Set Budget</button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="btn-secondary px-3 py-1.5 text-xs">← Prev</button>
        <span className="font-display font-semibold text-slate-800 dark:text-white min-w-[140px] text-center">
          {displayMonth}
        </span>
        <button onClick={nextMonth} className="btn-secondary px-3 py-1.5 text-xs">Next →</button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Budgeted</p>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalBudget, currency)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
            <p className={`text-2xl font-display font-bold ${totalSpent > totalBudget ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatCurrency(totalSpent, currency)}
            </p>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-slate-500 dark:text-slate-400">No budgets set for {displayMonth}.</p>
          <button className="btn-primary mt-4" onClick={() => setShowForm(true)}>Set your first budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => (
            <div key={b._id} className="relative group">
              <BudgetProgress budget={b} currency={currency} />
              <button
                onClick={() => handleDelete(b._id)}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md
                           bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 text-xs
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Set budget modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={`Set Budget — ${displayMonth}`}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Category *</label>
            <select
              className="input"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              required
            >
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit ({currency}) *</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 5000"
              value={form.limit}
              onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
