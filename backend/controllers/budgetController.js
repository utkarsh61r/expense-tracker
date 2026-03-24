// controllers/budgetController.js — CRUD for per-category budgets
const Budget  = require('../models/Budget');
const Expense = require('../models/Expense');

// GET /api/budgets?month=YYYY-MM
exports.getBudgets = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ user: req.user._id, month });

    // Attach current spending to each budget
    const start = new Date(`${month}-01`);
    const end   = new Date(start.getFullYear(), start.getMonth() + 1, 1);

    const spending = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);
    const spendMap = Object.fromEntries(spending.map((s) => [s._id, s.spent]));

    const enriched = budgets.map((b) => ({
      ...b.toObject(),
      spent:      spendMap[b.category] || 0,
      percentage: Math.min(((spendMap[b.category] || 0) / b.limit) * 100, 100),
    }));

    res.json({ success: true, budgets: enriched });
  } catch (err) { next(err); }
};

// POST /api/budgets
exports.setBudget = async (req, res, next) => {
  try {
    const { category, month, limit } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month },
      { limit },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ success: true, budget });
  } catch (err) { next(err); }
};

// DELETE /api/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Budget removed' });
  } catch (err) { next(err); }
};
