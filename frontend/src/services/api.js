import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — clear token and redirect
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Expense service helpers ───────────────────────────────────────────────────
export const expenseService = {
  getAll:    (params) => api.get('/expenses', { params }),
  getOne:    (id)     => api.get(`/expenses/${id}`),
  create:    (data)   => api.post('/expenses', data),
  update:    (id, d)  => api.put(`/expenses/${id}`, d),
  remove:    (id)     => api.delete(`/expenses/${id}`),
  summary:   ()       => api.get('/expenses/analytics/summary'),
};

export const budgetService = {
  getAll:  (month) => api.get('/budgets', { params: { month } }),
  set:     (data)  => api.post('/budgets', data),
  remove:  (id)    => api.delete(`/budgets/${id}`),
};

export const userService = {
  updateProfile:  (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  exportCSV:      ()     => api.get('/users/export', { responseType: 'blob' }),
};
