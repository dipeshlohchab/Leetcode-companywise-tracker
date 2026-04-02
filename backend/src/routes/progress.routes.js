const express = require('express');
const router = express.Router();
const {
  updateProgress,
  getUserProgress,
  getCompanyProgress,
  getRecentActivity,
  getDailyStats,
  toggleBookmark,
  getBookmarks
} = require('../controllers/progress.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', updateProgress);
router.get('/stats', getUserProgress);
router.get('/companies', getCompanyProgress);
router.get('/activity', getRecentActivity);
router.get('/daily', getDailyStats);
router.post('/bookmark', toggleBookmark);
router.get('/bookmarks', getBookmarks);

module.exports = router;
