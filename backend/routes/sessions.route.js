const express = require('express');
const router = express.Router();
const Session = require('../models/session.model')

// ดึง 3 Session ล่าสุด
router.get('/latest', async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ date: -1 }) // -1 คือเรียงจากวันที่ใหม่สุดไปเก่าสุด
      .limit(3);          // เอาแค่ 3 อัน
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET session by id
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});



// ✅ Get sessions by seasonId
router.get("/season/:seasonId", async (req, res) => {
  try {
    const { seasonId } = req.params;

    const sessions = await Session.find({ seasonId });

    res.json(sessions);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;