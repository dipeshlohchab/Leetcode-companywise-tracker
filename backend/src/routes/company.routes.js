const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

router.get('/', async (req, res, next) => {
  try {
    const counts = await Question.aggregate([
      { $unwind: '$companies' },
      { $group: { _id: '$companies', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const companies = counts.map(c => ({ name: c._id, count: c.count }));
    res.json({ companies });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
