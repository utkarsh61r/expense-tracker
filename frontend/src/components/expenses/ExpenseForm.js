import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { expenseService } from '../../services/api';
import { CATEGORIES, PAYMENT_METHODS } from '../../utils/helpers';
import { format } from 'date-fns';

const EMPTY = {
  title: '', amount: '', category: '', date: format(new Date(), 'yyyy-MM-dd'),
  paymentMethod: 'Other', notes: '', tags: '',
};

export default function ExpenseForm({ expense, onSuccess, onCancel }) {
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        title:         expense.title,
        amount:        expense.amount,
        category:      expense.category,
        date:          format(new Date(expense.date), 'yyyy-MM-dd'),
        paymentMethod: expense.paymentMethod || 'Other',
        notes:         expense.notes || '',
        tags:          (expense.tags || []).join(', '),
      });
    }
  }, [expense]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        tags:   form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      let result;
      if (expense) {
        result = await expenseService.update(expense._id, payload);
        toast.success('Expense updated!');
      } else {
        result = await expenseService.create(payload);
        if (result.data.budgetAlert) {
          const { category, spent, limit } = result.data.budgetAlert;
          toast.error(`⚠️ Budget exceeded for ${category}! Spent $${spent.toFixed(2)} of $${limit}`, { duration: 5000 });
        } else {
          toast.success('Expense added!');
        }
      }
      onSuccess(result.data.expense);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title + Amount */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Title *</label>
          <input className="input" placeholder="Coffee, Uber…" value={form.title} onChange={set('title')} required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Amount *</label>
          <input className="input" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} required />
        </div>
      </div>

      {/* Category + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.category} onChange={set('category')} required>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date *</label>
          <input className="input" type="date" value={form.date} onChange={set('date')} required />
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="label">Payment Method</label>
        <select className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={2} placeholder="Optional details…" value={form.notes} onChange={set('notes')} />
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags <span className="text-slate-400 font-normal">(comma-separated)</span></label>
        <input className="input" placeholder="lunch, client, work" value={form.tags} onChange={set('tags')} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Saving…' : expense ? 'Update' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
