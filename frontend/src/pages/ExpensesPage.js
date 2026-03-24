import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { expenseService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, downloadBlob } from '../utils/helpers';
import ExpenseCard from '../components/expenses/ExpenseCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Modal       from '../components/ui/Modal';

const LIMIT = 10;

export default function ExpensesPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [expenses, setExpenses] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editExp,  setEditExp]  = useState(null);

  // Filters
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [sortBy,    setSortBy]    = useState('date');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sortBy };
      if (search)    params.search    = search;
      if (category)  params.category  = category;
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;
      const res = await expenseService.getAll(params);
      setExpenses(res.data.expenses);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load expenses'); }
    finally  { setLoading(false); }
  }, [page, search, category, startDate, endDate, sortBy]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category, startDate, endDate, sortBy]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await expenseService.remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const handleFormSuccess = () => { setShowForm(false); setEditExp(null); load(); };

  const handleExport = async () => {
    try {
      const res = await userService.exportCSV();
      downloadBlob(res.data, 'expenses.csv');
      toast.success('CSV downloaded!');
    } catch { toast.error('Export failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">All Expenses</h2>
          <p className="text-sm text-slate-500">{total} total records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-xs px-3">
            ↓ Export CSV
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            className="input col-span-2 md:col-span-1"
            placeholder="🔍 Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input className="input" type="date" value={endDate}   onChange={e => setEndDate(e.target.value)} />
          <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
          </select>
        </div>
        {(search || category || startDate || endDate) && (
          <button
            className="mt-3 text-xs text-brand-500 hover:underline"
            onClick={() => { setSearch(''); setCategory(''); setStartDate(''); setEndDate(''); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🧾</p>
          <p className="text-slate-500 dark:text-slate-400">No expenses found.</p>
          <button className="btn-primary mt-4" onClick={() => setShowForm(true)}>Add your first expense</button>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map(e => (
            <ExpenseCard
              key={e._id} expense={e} currency={currency}
              onEdit={(exp) => { setEditExp(exp); setShowForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            className="btn-secondary px-3 py-1.5 text-xs"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary px-3 py-1.5 text-xs"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
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
