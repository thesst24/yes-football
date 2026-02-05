// models/season.model.js
const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // เช่น "Season 2026 #1"
  },
  startDate: {
    type: Date,
    required: true,
  },
  weeks: {
    type: Number,
    default: 5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Season', seasonSchema);
