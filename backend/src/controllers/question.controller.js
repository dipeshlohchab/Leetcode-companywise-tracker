const Question = require('../models/Question');
const Progress = require('../models/Progress');

const getQuestions = async (req, res, next) => {
  try {
    const { company, difficulty, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (company) filter.companies = company;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ frequency: -1, title: 1 }).skip(skip).limit(parseInt(limit)).lean(),
      Question.countDocuments(filter)
    ]);

    // If user is authenticated, attach progress
    if (req.user) {
      const questionIds = questions.map(q => q._id);
      const progressRecords = await Progress.find({
        userId: req.user._id,
        questionId: { $in: questionIds }
      }).lean();

      const progressMap = {};
      progressRecords.forEach(p => {
        progressMap[p.questionId.toString()] = p.status;
      });

      questions.forEach(q => {
        q.userStatus = progressMap[q._id.toString()] || 'not_attempted';
      });
    }

    res.json({
      questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCompanies = async (req, res, next) => {
  try {
    const companies = await Question.distinct('companies');
    const sorted = companies.filter(Boolean).sort((a, b) => a.localeCompare(b));

    // Get question counts per company
    const counts = await Question.aggregate([
      { $unwind: '$companies' },
      { $group: { _id: '$companies', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    const result = sorted.map(company => ({
      name: company,
      count: countMap[company] || 0
    }));

    res.json({ companies: result });
  } catch (error) {
    next(error);
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    if (req.user) {
      const progress = await Progress.findOne({ userId: req.user._id, questionId: question._id });
      question.userStatus = progress?.status || 'not_attempted';
      question.userNotes = progress?.notes || '';
    }

    res.json({ question });
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuestions, getCompanies, getQuestion };
