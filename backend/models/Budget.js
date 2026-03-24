// models/Budget.js — Per-category monthly budget
const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    // Month stored as "YYYY-MM" string for easy querying
    month: { type: String, required: true },
    limit: { type: Number, required: true, min: [1, 'Limit must be positive'] },
  },
  { timestamps: true }
);

// One budget per category per month per user
BudgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
