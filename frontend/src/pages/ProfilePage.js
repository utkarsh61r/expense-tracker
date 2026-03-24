import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadBlob } from '../utils/helpers';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD'];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [profile, setProfile] = useState({
    name:          user?.name || '',
    currency:      user?.currency || 'USD',
    monthlyBudget: user?.monthlyBudget || '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [exporting,     setExporting]     = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile({
        ...profile,
        monthlyBudget: profile.monthlyBudget ? parseFloat(profile.monthlyBudget) : 0,
      });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Change failed'); }
    finally { setSavingPw(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await userService.exportCSV();
      downloadBlob(res.data, `expenses-${new Date().toISOString().slice(0,10)}.csv`);
      toast.success('CSV downloaded!');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar / header */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold font-display flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-display font-semibold text-xl text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-400 mt-0.5">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
        </div>
      </div>

      {/* Profile settings */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-5">Profile Settings</h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select
                className="input"
                value={profile.currency}
                onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
              >
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Monthly Budget Limit</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0 = no limit"
                value={profile.monthlyBudget}
                onChange={e => setProfile(p => ({ ...p, monthlyBudget: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-5">Change Password</h3>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              className="input" type="password" placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                className="input" type="password" placeholder="Min. 6 chars"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                required minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                className="input" type="password" placeholder="••••••••"
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={savingPw}>
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Data management */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">Data</h3>
        <p className="text-sm text-slate-500 mb-4">Export all your expenses to a CSV file.</p>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary" disabled={exporting}>
            {exporting ? 'Exporting…' : '↓ Export all as CSV'}
          </button>
          <button
            onClick={() => { if (window.confirm('Sign out?')) logout(); }}
            className="btn-danger"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
