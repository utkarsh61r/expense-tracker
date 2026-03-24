// models/Expense.js — Mongoose schema for an expense entry
const mongoose = require('mongoose');

const CATEGORIES = [
  'Food & Dining',
  'Travel',
  'Bills & Utilities',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Personal Care',
  'Home',
  'Other',
];

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other'],
      default: 'Other',
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Index for fast per-user queries sorted by date
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });

// Expose category enum for reuse elsewhere
ExpenseSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Expense', ExpenseSchema);
