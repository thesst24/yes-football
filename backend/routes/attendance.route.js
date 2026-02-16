const express = require("express");
const router = express.Router();

const Attendance = require("../models/attendance.model");
const Card = require("../models/memberCard.model");
const Member = require('../models/member.model');
const Participant = require("../models/participant.model");



router.post("/checkin", async (req, res) => {
  try {
    const { memberId, seasonId, sessionId } = req.body;

    if (!memberId || !seasonId || !sessionId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ Prevent duplicate checkin
    const already = await Attendance.findOne({ memberId, sessionId });
    if (already) {
      return res.status(400).json({ message: "Already checked in" });
    }

    // ✅ Find card
    const card = await Card.findOne({ memberId });
    if (!card) {
      return res.status(400).json({ message: "Card not found" });
    }

    if (card.usedSessions >= card.totalSessions) {
      return res.status(400).json({ message: "Card full, please renew card" });
    }

    // ✅ Save attendance
    const attendance = new Attendance({
      memberId,
      seasonId,
      sessionId,
      checkinDate: new Date(),
    });

    await attendance.save();

 // ✅ Update Participant Status → Present (Auto Create)
let participant = await Participant.findOne({ sessionId, memberId });

if (!participant) {
  participant = await Participant.create({
    sessionId,
    memberId,
    status: "present",
  });
} else {
  participant.status = "present";
  await participant.save();
}

    // ✅ Update card usage
    card.usedSessions += 1;

    card.checkins.push({
      sessionId,
      checkinDate: new Date(),
    });

    // ✅ Full → inactive
    if (card.usedSessions >= card.totalSessions) {
      card.status = "inactive";

      await Member.findByIdAndUpdate(memberId, {
        status: false,
      });
    }

    await card.save();

    return res.json({
      message: "✅ Checkin Success",
      attendance,
      card,
    });
  } catch (err) {
    console.error("❌ Checkin Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

router.get("/session/:sessionId", async (req, res) => {
  const data = await Attendance.find({ sessionId: req.params.sessionId })
    .populate("memberId");

  res.json(data);
});


module.exports = router;