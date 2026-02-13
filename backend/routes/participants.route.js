const express = require("express");
const router = express.Router();
const Participant = require("../models/participant.model");


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

router.delete("/removeAll/:sessionId", async (req, res) => {
  await Participant.deleteMany({ sessionId: req.params.sessionId });
  res.json({ message: "All participants removed" });
});
// ✅ REMOVE Participant
router.delete("/:sessionId/:memberId", async (req, res) => {
  await Participant.deleteOne({
    sessionId: req.params.sessionId,
    memberId: req.params.memberId,
  });

  res.json({ message: "Removed successfully" });
});

module.exports = router;