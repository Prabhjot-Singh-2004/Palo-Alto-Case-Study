const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  platform: String,
  url: String,
  skill: {
    type: String,
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  estimatedWeeks: {
    type: Number,
    default: 2,
  },
  description: String,
  tags: [String],
});

module.exports = mongoose.model('Course', courseSchema);
