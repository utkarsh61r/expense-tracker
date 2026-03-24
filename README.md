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

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9b938b0e-8b5b-48c9-8b7f-ddfeea3060d2" />
<img width="1920" height="1080" alt="Screenshot 2026-03-25 022233" src="https://github.com/user-attachments/assets/338b5027-87ca-4801-b03b-b7c3a710f6b4" />

