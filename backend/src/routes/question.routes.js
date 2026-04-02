const express = require('express');
const router = express.Router();
const { getQuestions, getCompanies, getQuestion } = require('../controllers/question.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Optional auth — attaches user if token present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifyToken } = require('../utils/jwt');
      const User = require('../models/User');
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.userId).select('-password');
    }
  } catch {}
  next();
};

router.get('/', optionalAuth, getQuestions);
router.get('/companies', getCompanies);
router.get('/:id', optionalAuth, getQuestion);

module.exports = router;
