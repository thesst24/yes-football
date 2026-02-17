const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  totalSessions: { type: Number, default: 10 },
  usedSessions: { type: Number, default: 0 },
  checkins: [
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    date: { type: Date, default: Date.now }
  }
],
  expiryDate: Date,
  status: { type: String, default: 'active' },
  renewedAt: { type: Date},
}, { timestamps: true });

module.exports = mongoose.model('MemberCard', cardSchema);
