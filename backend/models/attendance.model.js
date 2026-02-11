const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
  checkinAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendance", attendanceSchema);

module.exports = mongoose.model("Attendance", attendanceSchema);