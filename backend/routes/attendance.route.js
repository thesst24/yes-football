const express = require("express");
const router = express.Router();

const Attendance = require("../models/attendance.model");
const MemberCard = require("../models/memberCard.model");
const Session = require("../models/session.model");

router.post("/checkin", async (req,res)=>{

  const { memberId, seasonId, sessionId } = req.body;

  // ❌ กันเช็คชื่อซ้ำ
  const exists = await Attendance.findOne({
    memberId,
    sessionId
  });

  if(exists){
    return res.status(400).json({
      message: "Already checked in"
    });
  }

  // ✅ บันทึก Attendance
  await Attendance.create({
    memberId,
    seasonId,
    sessionId
  });

  // ✅ Update Card usedSessions
  await Card.updateOne(
    { memberId, seasonId },
    { $inc: { usedSessions: 1 } }
  );

  res.json({ success:true });
});

module.exports = router;