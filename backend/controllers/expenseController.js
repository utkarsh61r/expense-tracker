// controllers/expenseController.js — Full CRUD + analytics for expenses
const Expense = require('../models/Expense');
const Budget  = require('../models/Budget');

// ── GET /api/expenses ─────────────────────────────────────────────────────────
// Supports: ?page, ?limit, ?category, ?startDate, ?endDate, ?search, ?sortBy
exports.getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10,
      category, startDate, endDate,
      search, sortBy = 'date',
    } = req.query;

    const filter = { user: req.user._id };

    if (category)            filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const total    = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
      expenses,
    });
  } catch (err) { next(err); }
};

// ── POST /api/expenses ────────────────────────────────────────────────────────
exports.createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });

    // Check budget alert for this category this month
    const month  = expense.date.toISOString().slice(0, 7);
    const budget = await Budget.findOne({ user: req.user._id, category: expense.category, month });
    let budgetAlert = null;

    if (budget) {
      const start = new Date(`${month}-01`);
      const end   = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const agg   = await Expense.aggregate([
        { $match: { user: req.user._id, category: expense.category, date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const spent = agg[0]?.total || 0;
      if (spent >= budget.limit) {
        budgetAlert = { category: expense.category, spent, limit: budget.limit };
      }
    }

    res.status(201).json({ success: true, expense, budgetAlert });
  } catch (err) { next(err); }
};

// ── GET /api/expenses/:id ─────────────────────────────────────────────────────
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, expense });
  } catch (err) { next(err); }
};

// ── PUT /api/expenses/:id ─────────────────────────────────────────────────────
exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, expense });
  } catch (err) { next(err); }
};

// ── DELETE /api/expenses/:id ──────────────────────────────────────────────────
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) { next(err); }
};

// ── GET /api/expenses/analytics/summary ──────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 6);

    // Total all-time
    const [totalAgg] = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // This month
    const [monthAgg] = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // This week
    const [weekAgg] = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // Category breakdown (current month)
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: monthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Daily spending for the last 30 days
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 29);
    const dailyTrend = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly spending for last 6 months
    const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(now.getMonth() - 5);
    const monthlyTrend = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      summary: {
        total:    { amount: totalAgg?.total || 0, count: totalAgg?.count || 0 },
        month:    { amount: monthAgg?.total || 0, count: monthAgg?.count || 0 },
        week:     { amount: weekAgg?.total  || 0, count: weekAgg?.count  || 0 },
        categoryBreakdown,
        dailyTrend,
        monthlyTrend,
      },
    });
  } catch (err) { next(err); }
};
