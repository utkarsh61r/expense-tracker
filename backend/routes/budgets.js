// routes/budgets.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(ctrl.getBudgets).post(ctrl.setBudget);
router.delete('/:id', ctrl.deleteBudget);

module.exports = router;
