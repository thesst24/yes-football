const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: "Season", required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },

    checkinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);