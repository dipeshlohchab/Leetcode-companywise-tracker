const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  status: {
    type: String,
    enum: ['solved', 'attempted', 'not_attempted'],
    default: 'not_attempted'
  },
  notes: {
    type: String,
    default: '',
    maxlength: 2000
  },
  solvedAt: {
    type: Date,
    default: null
  },
  attemptCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

progressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Progress', progressSchema);
