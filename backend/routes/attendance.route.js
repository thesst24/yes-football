const express = require("express");
const router = express.Router();

const Attendance = require("../models/attendance.model");
const Card = require("../models/memberCard.model");

router.post("/checkin", async (req, res) => {
  try {

    const { memberId, seasonId, sessionId } = req.body;


    // 1) Validate input
    if (!memberId || !seasonId || !sessionId) {
      console.log("❌ Missing Data");
      return res.status(400).json({ message: "Missing fields" });
    }

    // 2) Prevent duplicate checkin
    const already = await Attendance.findOne({ memberId, sessionId });
    console.log("already:", already);

    if (already) {
      console.log("❌ Duplicate Checkin");
      return res.status(400).json({ message: "Already checked in" });
    }

    // 3) Find card
    const card = await Card.findOne({ memberId });
    console.log("card:", card);

    if (!card) {
      console.log("❌ Card Not Found");
      return res.status(400).json({ message: "Card not found" });
    }

    // 4) Card full?
    if (card.usedSessions >= card.totalSessions) {
      console.log("❌ Card Full");
      return res.status(400).json({ message: "Card full" });
    }

    // 5) Save attendance
    const attendance = new Attendance({
      memberId,
      seasonId,
      sessionId,
      checkinDate: new Date(),
    });

    await attendance.save();

    // 6) Update card usage
    card.usedSessions += 1;
    card.checkins.push({
  sessionId: sessionId,
  date: new Date()
});
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



module.exports = router;