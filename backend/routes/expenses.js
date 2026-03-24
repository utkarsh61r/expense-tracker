// routes/expenses.js
const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();
const ctrl      = require('../controllers/expenseController');
const { protect }  = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All expense routes require authentication
router.use(protect);

const expenseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Invalid date'),
];

router.get('/analytics/summary', ctrl.getSummary);   // must come before /:id
router.route('/')
  .get(ctrl.getExpenses)
  .post(expenseValidation, validate, ctrl.createExpense);

router.route('/:id')
  .get(ctrl.getExpense)
  .put(expenseValidation, validate, ctrl.updateExpense)
  .delete(ctrl.deleteExpense);

module.exports = router;
