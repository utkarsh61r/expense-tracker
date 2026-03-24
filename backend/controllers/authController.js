// controllers/authController.js — Register & Login logic
const User = require('../models/User');

// ── Helper: send token response ───────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = user.generateJWT();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:           user._id,
      name:          user.name,
      email:         user.email,
      currency:      user.currency,
      monthlyBudget: user.monthlyBudget,
      theme:         user.theme,
      avatar:        user.avatar,
    },
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Duplicate email check
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Select password back in for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
