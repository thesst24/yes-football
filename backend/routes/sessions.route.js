const express = require('express');
const router = express.Router();

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

module.exports = router;