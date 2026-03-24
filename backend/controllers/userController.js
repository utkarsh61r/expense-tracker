// controllers/userController.js — Profile management
const User    = require('../models/User');
const Expense = require('../models/Expense');

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'currency', 'monthlyBudget', 'theme', 'avatar'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/users/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

// GET /api/users/export  — returns CSV of all user expenses
exports.exportCSV = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

    const header = 'Date,Title,Category,Amount,Payment Method,Notes\n';
    const rows   = expenses.map((e) =>
      `"${new Date(e.date).toLocaleDateString()}","${e.title}","${e.category}",${e.amount},"${e.paymentMethod}","${e.notes || ''}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(header + rows);
  } catch (err) { next(err); }
};
