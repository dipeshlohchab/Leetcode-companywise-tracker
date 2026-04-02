const Progress = require('../models/Progress');
const Question = require('../models/Question');
const User = require('../models/User');

const updateProgress = async (req, res, next) => {
  try {
    const { questionId, status, notes } = req.body;

    if (!questionId || !status) {
      return res.status(400).json({ error: 'questionId and status are required.' });
    }
    if (!['solved', 'attempted', 'not_attempted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    const existing = await Progress.findOne({ userId: req.user._id, questionId });

    let progress;
    if (existing) {
      const wasSolved = existing.status === 'solved';
      existing.status = status;
      if (notes !== undefined) existing.notes = notes;
      if (status === 'solved' && !wasSolved) {
        existing.solvedAt = new Date();
        existing.attemptCount += 1;
      } else if (status !== 'solved') {
        existing.solvedAt = null;
      }
      progress = await existing.save();
    } else {
      progress = await Progress.create({
        userId: req.user._id,
        questionId,
        status,
        notes: notes || '',
        solvedAt: status === 'solved' ? new Date() : null,
        attemptCount: status !== 'not_attempted' ? 1 : 0
      });
    }

    // Update user streak and totalSolved
    const user = await User.findById(req.user._id);
    if (status === 'solved') {
      user.updateStreak();
    }
    const totalSolved = await Progress.countDocuments({ userId: req.user._id, status: 'solved' });
    user.totalSolved = totalSolved;
    await user.save();

    res.json({ progress, totalSolved });
  } catch (error) {
    next(error);
  }
};

const getUserProgress = async (req, res, next) => {
  try {
    const { company } = req.query;
    const userId = req.user._id;

    let questionIds = null;

    // Only fetch IDs (not full documents)
    if (company) {
      questionIds = await Question.find({ companies: company }).distinct('_id');
    }

    const baseQuery = { userId };

    if (questionIds) {
      baseQuery.questionId = { $in: questionIds };
    }

    const [solved, attempted, total] = await Promise.all([
      Progress.countDocuments({ ...baseQuery, status: 'solved' }),
      Progress.countDocuments({ ...baseQuery, status: 'attempted' }),
      company
        ? Question.countDocuments({ companies: company })
        : Question.countDocuments()
    ]);

    res.json({
      solved,
      attempted,
      total,
      notAttempted: total - solved - attempted
    });

  } catch (error) {
    next(error);
  }
};

const getCompanyProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await Progress.aggregate([
      {
        $match: {
          userId,
          status: { $in: ['solved', 'attempted'] }
        }
      },

      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'question'
        }
      },

      { $unwind: '$question' },
      { $unwind: '$question.companies' },

      {
        $group: {
          _id: '$question.companies',
          solved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'solved'] }, 1, 0]
            }
          },
          attempted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'attempted'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get total questions per company (fast, cached)
    const totals = await Question.aggregate([
      { $unwind: '$companies' },
      {
        $group: {
          _id: '$companies',
          total: { $sum: 1 }
        }
      }
    ]);

    const totalMap = {};
    totals.forEach(t => {
      totalMap[t._id] = t.total;
    });

    const final = result.map(r => ({
      company: r._id,
      total: totalMap[r._id] || 0,
      solved: r.solved,
      attempted: r.attempted,
      percentage: totalMap[r._id]
        ? Math.round((r.solved / totalMap[r._id]) * 100)
        : 0
    }));

    final.sort((a, b) => b.solved - a.solved);

    res.json({ companies: final });

  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const recent = await Progress.find({
      userId: req.user._id,
      status: { $in: ['solved', 'attempted'] }
    })
    .populate('questionId', 'title link difficulty companies')
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

    res.json({ activity: recent });
  } catch (error) {
    next(error);
  }
};

const getDailyStats = async (req, res, next) => {
  try {
    // Last 30 days heatmap data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Progress.aggregate([
      {
        $match: {
          userId: req.user._id,
          status: 'solved',
          solvedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$solvedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ dailyStats: stats });
  } catch (error) {
    next(error);
  }
};

const toggleBookmark = async (req, res, next) => {
  try {
    const { questionId } = req.body;
    const user = await User.findById(req.user._id);

    const bookmarkIndex = user.bookmarks.indexOf(questionId);
    if (bookmarkIndex > -1) {
      user.bookmarks.splice(bookmarkIndex, 1);
    } else {
      user.bookmarks.push(questionId);
    }
    await user.save();

    res.json({ bookmarks: user.bookmarks, isBookmarked: bookmarkIndex === -1 });
  } catch (error) {
    next(error);
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks').lean();
    const bookmarkedQuestions = user.bookmarks || [];

    // Attach progress
    const progressRecords = await Progress.find({
      userId: req.user._id,
      questionId: { $in: bookmarkedQuestions.map(q => q._id) }
    }).lean();

    const progressMap = {};
    progressRecords.forEach(p => { progressMap[p.questionId.toString()] = p.status; });

    bookmarkedQuestions.forEach(q => {
      q.userStatus = progressMap[q._id.toString()] || 'not_attempted';
    });

    res.json({ bookmarks: bookmarkedQuestions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProgress,
  getUserProgress,
  getCompanyProgress,
  getRecentActivity,
  getDailyStats,
  toggleBookmark,
  getBookmarks
};
