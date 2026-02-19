const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


const Participant = require("../models/participant.model");
const Attendance =require('../models/attendance.model');
const Card = require('../models/memberCard.model');
const Member = require('../models/member.model');



// ✅ GET Participants by Session
router.get("/:sessionId", async (req, res) => {

  const participants = await Participant.find({
    sessionId: req.params.sessionId
  }).populate("memberId");

  // ✅ remove broken participants
  const clean = participants.filter(p => p.isTrial || p.memberId);

  res.json(clean);
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

    // 1️⃣ ลบ checkins ของ session นี้ออกจากทุก card
    await Card.updateMany(
      { "checkins.sessionId": sessionId },
      {
        $pull: { checkins: { sessionId } }
      }
    );

    // 2️⃣ sync usedSessions = checkins.length (loop แบบปลอดภัย)
    const cards = await Card.find({});

    for (let card of cards) {
      card.usedSessions = card.checkins.length;
      await card.save();
    }

    // 3️⃣ Reactivate members
    const attendances = await Attendance.find({ sessionId });
    const memberIds = attendances.map(a => a.memberId);

    await Member.updateMany(
      { _id: { $in: memberIds } },
      { status: true }
    );

    // 4️⃣ ลบ attendance + participant
    await Attendance.deleteMany({ sessionId });
    await Participant.deleteMany({ sessionId });

    res.json({ message: "✅ Removed All + Card Rolled Back" });

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

  // 2) Remove Attendance
  await Attendance.deleteOne({ sessionId, memberId });

  // 3) Rollback Card
  const card = await Card.findOne({ memberId });

  if (card) {
    const before = card.checkins.length;

    // remove checkin history
    card.checkins = card.checkins.filter(
      (c) => c.sessionId.toString() !== sessionId
    );

    const after = card.checkins.length;

    // rollback usedSessions only if actually removed
    if (before !== after) {
      card.usedSessions = Math.max(0, card.usedSessions - 1);
    }

    // reactivate
    card.status = "active";

    await card.save();
  }

  res.json({ message: "✅ Removed + Card Rolled Back" });
});


router.delete("/removeTrial/:sessionId/:trialId", async (req, res) => {
  try {
    const { sessionId, trialId } = req.params;

    // ✅ ลบ Trial Participant โดย _id
    await Participant.deleteOne({
      _id: trialId,
      sessionId,
      isTrial: true
    });

    // ✅ ลบ Attendance ด้วย
    await Attendance.deleteOne({
      sessionId,
      isTrial: true,
      _id: trialId
    });

    res.json({ message: "✅ Trial Removed Successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/join", async (req, res) => {
  try {
    const { memberId, sessionId, seasonId } = req.body;

    // ถ้ามีอยู่แล้ว
    const exists = await Participant.findOne({ memberId, sessionId });
    if (exists) {
      return res.status(400).json({ message: "Already joined" });
    }

    // ✅ Create Participant = pending
    const participant = await Participant.create({
      memberId,
      sessionId,
      seasonId,
      status: "pending"
    });

    res.json({
      message: "✅ Joined Event (Pending)",
      participant
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;