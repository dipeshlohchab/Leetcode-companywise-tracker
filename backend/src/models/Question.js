const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleSlug: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Unknown'],
    default: 'Unknown'
  },
  companies: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  frequency: {
    type: Number,
    default: 0
  },
  leetcodeId: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

questionSchema.index({ companies: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ title: 'text', titleSlug: 'text' });

module.exports = mongoose.model('Question', questionSchema);
