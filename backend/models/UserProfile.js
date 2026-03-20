const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  rawText: {
    type: String,
    required: true,
  },
  matchedSkills: [
    {
      skill: String,
      category: {
        type: String,
        enum: ['Foundational', 'Frameworks', 'Tools', 'Soft Skills'],
      },
      proficiency: String,
    },
  ],
  missingSkills: [
    {
      skill: String,
      category: {
        type: String,
        enum: ['Foundational', 'Frameworks', 'Tools', 'Soft Skills'],
      },
      importance: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
      },
    },
  ],
  gapAnalysisStatus: {
    type: String,
    enum: ['pending', 'completed', 'fallback', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
