// routes/users.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.put('/profile',  ctrl.updateProfile);
router.put('/password', ctrl.changePassword);
router.get('/export',   ctrl.exportCSV);

module.exports = router;
