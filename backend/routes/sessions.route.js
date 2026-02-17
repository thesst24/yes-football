const express = require("express");
const router = express.Router();
const Session = require("../models/session.model");

// ===============================
// ✅ Helper: Auto Mark Completed
// ===============================
async function autoCompleteSessions(sessions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let s of sessions) {
    const sessionDate = new Date(s.date);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate < today && s.status !== "completed") {
      s.status = "completed";
      await s.save();
    }
  }
}

// ===============================
// ✅ GET Sessions by SeasonId
// ===============================
router.get("/season/:seasonId", async (req, res) => {
  try {
    const sessions = await Session.find({
      seasonId: req.params.seasonId,
    }).sort({ date: 1 });

    // ✅ Auto mark completed
    await autoCompleteSessions(sessions);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// ✅ GET Session by Id
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // ✅ Auto mark completed for single session
    await autoCompleteSessions([session]);

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// ✅ Latest Sessions
// ===============================
router.get("/latest", async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ date: -1 })
      .limit(3);

    await autoCompleteSessions(sessions);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;