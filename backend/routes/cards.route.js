const express = require("express");
const router = express.Router();
const MemberCard = require("../models/memberCard.model");
const Attendance = require('../models/attendance.model');
const Member = require('../models/member.model');


// ✅ GET Card by memberId
router.get("/:memberId", async (req, res) => {
  const memberId = req.params.memberId;

  let card = await MemberCard.findOne({ memberId });

  if (!card) {
    card = await MemberCard.create({
      memberId,
      usedSessions: 0,
      totalSessions: 10,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }

  res.json(card);
});

// ✅ Renew Card
router.post("/renew", async (req, res) => {
  try {
    const { memberId } = req.body;

    const card = await MemberCard.findOne({ memberId });

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const isFullUsed = card.usedSessions >= card.totalSessions;

    if (!isFullUsed) {
      await Member.findByIdAndUpdate(memberId, { status: true });
      card.status = "active";
      await card.save();

      return res.json({
        message: "Activated (No Renew)",
        card,
      });
    }

    card.usedSessions = 0;
    card.checkins = [];
    card.status = "active";
    card.renewHistory.push(new Date());

    await card.save();
    await Member.findByIdAndUpdate(memberId, { status: true });

    res.json({
      message: "Renewed Successfully",
      card,
    });

  } catch (err) {
    console.error("Renew Error:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;