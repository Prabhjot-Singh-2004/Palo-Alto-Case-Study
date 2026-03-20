const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    index: true,
  },
  skills: [
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
      frequency: Number, // How often it appears in job postings (%)
    },
  ],
  description: String,
  sampleRequirements: [String],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MarketData', marketDataSchema);
