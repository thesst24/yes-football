const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },

  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },

status: {
  type: String,
  enum: ["pending", "present", "absent"],
  default: "pending",
},

  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Participant", participantSchema);