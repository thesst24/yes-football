const express = require("express");
const router = express.Router();
const Participant = require("../models/participant.model");
const Attendance =require('../models/attendance.model');
const Card = require('../models/memberCard.model');
const Member = require('../models/member.model');


// ✅ JOIN MEMBER
router.post("/join", async (req, res) => {
  const { sessionId, memberId } = req.body;

  // กันซ้ำ
  const exists = await Participant.findOne({ sessionId, memberId });
  if (exists) return res.status(400).json({ message: "Already joined" });

  const participant = await Participant.create({
    sessionId,
    memberId,
  });

  res.json(participant);
});


// ✅ GET Participants by Session
router.get("/:sessionId", async (req, res) => {
  const participants = await Participant.find({
    sessionId: req.params.sessionId,
  }).populate("memberId");

  res.json(participants);
});



// ✅ UPDATE Attendance Status
router.patch("/status", async (req, res) => {
  const { sessionId, memberId, status } = req.body;

  const updated = await Participant.findOneAndUpdate(
    { sessionId, memberId },
    { status },
    { new: true }
  );

  res.json(updated);
});

router.delete("/removeAllWithAttendance/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1) Find all attendance records in this session
    const attendances = await Attendance.find({ sessionId });

    // 2) Loop rollback card for each member
    for (let a of attendances) {
      const memberId = a.memberId;

      const card = await Card.findOne({ memberId });

      if (card) {
        // ลด usedSessions
        card.usedSessions = Math.max(0, card.usedSessions - 1);

        // remove checkin history for this session
        card.checkins = card.checkins.filter(
          (c) => c.sessionId.toString() !== sessionId
        );

        // reactivate card
        card.status = "active";
        await card.save();
      }

      // reactivate member
      await Member.findByIdAndUpdate(memberId, { status: true });
    }

    // 3) Delete all attendance
    await Attendance.deleteMany({ sessionId });

    // 4) Delete all participants
    await Participant.deleteMany({ sessionId });

    res.json({ message: "✅ Removed All + Rollback Complete" });
  } catch (err) {
    console.error("❌ RemoveAll Error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ REMOVE Participant
router.delete("/:sessionId/:memberId", async (req, res) => {
  await Participant.deleteOne({
    sessionId: req.params.sessionId,
    memberId: req.params.memberId,
  });

  res.json({ message: "Removed successfully" });
});
router.delete("/removeWithAttendance/:sessionId/:memberId", async (req, res) => {
  const { sessionId, memberId } = req.params;

  // 1) Remove Participant
  await Participant.deleteOne({ sessionId, memberId });

  // 2) Remove Attendance Record
  await Attendance.deleteOne({ sessionId, memberId });

  // 3) Rollback Card
  const card = await Card.findOne({ memberId });

  if (card && card.usedSessions > 0) {
    card.usedSessions -= 1;

    // remove checkin history
    card.checkins = card.checkins.filter(
      (c) => c.sessionId.toString() !== sessionId
    );

    // reactivate card
    card.status = "active";
    await card.save();
  }

  // 4) Reactivate Member
  await Member.findByIdAndUpdate(memberId, { status: true });

  res.json({ message: "Removed + Attendance Rolled Back" });
});

module.exports = router;