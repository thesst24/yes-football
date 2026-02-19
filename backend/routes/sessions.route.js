const express = require("express");
const router = express.Router();
const Session = require("../models/session.model");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);


// ===============================
// ✅ Helper: Auto Mark Completed
// ===============================
async function autoCompleteSessions() {

  const nowLaos = dayjs().tz("Asia/Vientiane");
  const startOfTodayLaos = nowLaos.startOf("day");
  const startOfTodayUTC = startOfTodayLaos.utc().toDate();

  await Session.updateMany(
    {
      date: { $lt: startOfTodayUTC },
      status: { $ne: "completed" }
    },
    {
      $set: { status: "completed" }
    }
  );

}


// ===============================
// ✅ GET Sessions by SeasonId
// ===============================
router.get("/season/:seasonId", async (req, res) => {
  try {

    await autoCompleteSessions();   // 🔥 update ก่อน

    const sessions = await Session.find({
      seasonId: req.params.seasonId,
    }).sort({ date: 1 });

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

    await autoCompleteSessions();

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

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