# 💰 Spendwise — Full-Stack Expense Tracker

A production-ready expense tracking web app with JWT auth, analytics dashboards, budget alerts, and dark mode.

---

## 📁 Folder Structure

```
expense-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── budgetController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect middleware
│   │   └── validate.js      # express-validator formatter
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── budgets.js
│   │   └── users.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.js
    │   │   ├── dashboard/
    │   │   │   ├── BudgetProgress.js
    │   │   │   ├── CategoryChart.js
    │   │   │   ├── StatCard.js
    │   │   │   └── TrendChart.js
    │   │   ├── expenses/
    │   │   │   ├── ExpenseCard.js
    │   │   │   └── ExpenseForm.js
    │   │   ├── layout/
    │   │   │   ├── Layout.js
    │   │   │   ├── Sidebar.js
    │   │   │   └── Topbar.js
    │   │   └── ui/
    │   │       └── Modal.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ExpensesPage.js
    │   │   ├── BudgetsPage.js
    │   │   └── ProfilePage.js
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

---

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev     # starts on http://localhost:5000
```

**`.env` values:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=change_me_to_something_long_and_random
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm start       # starts on http://localhost:3000
```

The `"proxy": "http://localhost:5000"` in `package.json` forwards all `/api/*` calls to the backend automatically in development.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| POST   | `/api/auth/register` | Register new user    |
| POST   | `/api/auth/login`    | Login, get JWT       |
| GET    | `/api/auth/me`       | Get current user 🔒  |

### Expenses 🔒
| Method | Endpoint                          | Description                     |
|--------|-----------------------------------|---------------------------------|
| GET    | `/api/expenses`                   | List (paginate/filter/search)   |
| POST   | `/api/expenses`                   | Create expense                  |
| GET    | `/api/expenses/:id`               | Get single expense              |
| PUT    | `/api/expenses/:id`               | Update expense                  |
| DELETE | `/api/expenses/:id`               | Delete expense                  |
| GET    | `/api/expenses/analytics/summary` | Dashboard analytics             |

**Query params for GET `/api/expenses`:**
```
?page=1&limit=10&category=Food+%26+Dining&startDate=2024-01-01&endDate=2024-12-31&search=coffee&sortBy=date
```

### Budgets 🔒
| Method | Endpoint          | Description                       |
|--------|-------------------|-----------------------------------|
| GET    | `/api/budgets`    | Get budgets for month (`?month=YYYY-MM`) |
| POST   | `/api/budgets`    | Set/update a category budget      |
| DELETE | `/api/budgets/:id`| Remove a budget                   |

### Users 🔒
| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| PUT    | `/api/users/profile`   | Update profile/settings|
| PUT    | `/api/users/password`  | Change password        |
| GET    | `/api/users/export`    | Download expenses CSV  |

---

## ✨ Features

- **JWT Auth** — secure register/login, token stored in localStorage, auto-injected on every request
- **Expenses CRUD** — create, edit, delete with category, date, payment method, notes, tags
- **Dashboard Analytics** — stat cards, donut category chart, line trend charts (daily + 6-month)
- **Budget Management** — per-category monthly limits with live progress bars and over-budget alerts
- **Dark Mode** — persisted to localStorage, respects OS preference on first visit
- **Search & Filter** — full-text search, category filter, date range, sort order
- **Pagination** — server-side paginated expense list
- **CSV Export** — one-click download of all expenses
- **Toast Notifications** — success/error/warning feedback throughout
- **Responsive** — mobile-first Tailwind layout with collapsible sidebar

---

## 🌍 Deploy

### Backend → [Render](https://render.com)
1. Create a new **Web Service**, connect your repo
2. Set **Build command**: `npm install`
3. Set **Start command**: `node server.js`
4. Add environment variables from `.env`

### Frontend → [Vercel](https://vercel.com)
1. Import your repo
2. Set **Root directory** to `frontend`
3. Add env var: `REACT_APP_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy

---

## 🔐 Security Notes
- Passwords hashed with **bcrypt** (12 rounds)
- JWT signed with a secret — use a long, random string in production
- All expense/budget routes verify the token and scope data to the authenticated user
- Input validated with **express-validator** before hitting the database

---

## 🧩 Extending

- **AI spending insights**: call the Anthropic API from the backend, passing the user's monthly summary to get personalized tips
- **Recurring expenses**: add a `recurring` field and a cron job to auto-create entries
- **Email notifications**: integrate Nodemailer + a cron to send weekly summaries
- **Google OAuth**: add `passport-google-oauth20` alongside the existing JWT flow
