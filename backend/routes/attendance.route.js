const express = require("express");
const router = express.Router();

const Attendance = require("../models/attendance.model");
const Card = require("../models/memberCard.model");
const Member = require('../models/member.model');
const Participant = require("../models/participant.model");


router.post("/checkin", async (req, res) => {
  try {
    const { memberId, sessionId, seasonId } = req.body;

    // ✅ 1) CHECK CARD ก่อน
    const card = await Card.findOne({ memberId });
    if (!card) return res.status(404).json({ message: "Card not found" });

    const alreadyChecked = card.checkins.some(
      (c) => c.sessionId.toString() === sessionId.toString()
    );

    if (alreadyChecked) {
      return res.status(400).json({
        message: "Already checked in this session",
      });
    }

    // ✅ 2) JOIN PARTICIPANT (ถ้ายังไม่มี)
    let participant = await Participant.findOne({ memberId, sessionId });

    if (!participant) {
      participant = await Participant.create({
        memberId,
        sessionId,
        seasonId,
        status: "present",
      });
    }

    // ✅ 3) JOIN ATTENDANCE (ถ้ายังไม่มี)
    let attendance = await Attendance.findOne({ memberId, sessionId });

    if (!attendance) {
      attendance = await Attendance.create({
        memberId,
        sessionId,
        seasonId,
      });
    }

    // ✅ 4) PUSH CHECKIN
    card.checkins.push({
      sessionId,
      date: new Date(),
    });

    card.usedSessions = card.checkins.length;

    if (card.usedSessions >= card.totalSessions) {

      await Member.findByIdAndUpdate(memberId, { status: false });
      card.status = "inactive";
    }

    await card.save();

    res.json({
      message: "Participant + Attendance + Checkin success",
      participant,
      attendance,
      card,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/trial", async (req, res) => {
  try {
    const { fullname, phone, seasonId, sessionId } = req.body;

    if (!fullname) {
      return res.status(400).json({ message: "Trial name required" });
    }

    // ✅ Trial Attendance Record
    const trialAttendance = await Attendance.create({
      isTrial: true,
      trialName: fullname,
      trialPhone: phone,
      seasonId,
      sessionId,
      status: "present"
    });

    res.json({ message: "Trial Added", data: trialAttendance });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/session/:sessionId", async (req, res) => {
  const data = await Attendance.find({ sessionId: req.params.sessionId })
    .populate("memberId");

  res.json(data);
});


module.exports = router;