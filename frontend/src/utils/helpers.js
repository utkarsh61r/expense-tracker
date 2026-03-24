import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Format currency with user's preferred currency code
export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);

// Format date for display
export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');

// Short date for charts
export const shortDate = (date) => format(new Date(date), 'MMM d');

// Month string YYYY-MM
export const monthStr = (date = new Date()) => format(date, 'yyyy-MM');

// Download a blob as a file
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// Category color map for charts
export const CATEGORY_COLORS = {
  'Food & Dining':   '#f59e0b',
  'Travel':          '#3b82f6',
  'Bills & Utilities':'#8b5cf6',
  'Shopping':        '#ec4899',
  'Entertainment':   '#06b6d4',
  'Healthcare':      '#10b981',
  'Education':       '#6366f1',
  'Personal Care':   '#f43f5e',
  'Home':            '#84cc16',
  'Other':           '#94a3b8',
};

export const CATEGORY_ICONS = {
  'Food & Dining':    '🍜',
  'Travel':           '✈️',
  'Bills & Utilities':'💡',
  'Shopping':         '🛍️',
  'Entertainment':    '🎬',
  'Healthcare':       '💊',
  'Education':        '📚',
  'Personal Care':    '💆',
  'Home':             '🏠',
  'Other':            '📦',
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other'];

// Truncate text
export const truncate = (str, n = 40) => str?.length > n ? str.slice(0, n) + '…' : str;
