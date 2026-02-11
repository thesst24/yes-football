const express = require('express');
const router = express.Router();
const Season = require('../models/season.model');
const Session = require('../models/session.model');
// backend/routes/season.route.js
router.post('/', async (req, res) => {
  try {
    // 1. รับค่า sessions ที่ส่งมาจาก Angular เพิ่มเติม
    const { name, startDate, endDate, sessions } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 2. สร้าง Season
    const newSeason = await Season.create({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    // 3. บันทึกอาเรย์ Sessions ลงใน Collection Session
    if (sessions && sessions.length > 0) {
      const sessionData = sessions.map((date, index) => ({
        seasonId: newSeason._id, // ใช้ ID จาก newSeason ที่เพิ่งสร้าง
        name: `Session ${index + 1}`,
        date: new Date(date),
        status: 'pending'
      }));

      await Session.insertMany(sessionData);
    }

    res.status(201).json({
      message: 'Season and Sessions created successfully',
      data: newSeason
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API สำหรับดึงรายการ Season
router.get('/', async (req, res) => {
  try {
    // 1. ตรวจสอบและอัปเดต Season ที่หมดอายุอัตโนมัติ
    const now = new Date();
    await Season.updateMany(
      { endDate: { $lt: now }, status: { $ne: 'inactive' } },
      { $set: { status: 'inactive' } }
    );

    // 2. ดึงรายการ Season 5 อันล่าสุด
    const seasons = await Season.find()
      .sort({ createdAt: -1 })
      .limit(3); // ปรับเป็น 3 ตามที่คุณต้องการก่อนหน้านี้

    res.json(seasons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ดึง 3 Sessions ล่าสุด
router.get('/latest-sessions', async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ date: -1 }) // เรียงจากใหม่ไปเก่า
      .limit(3);          // เอาแค่ 3 รายการ
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET sessions ของ season ที่เลือก
router.get("/:seasonId/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({
      seasonId: req.params.seasonId
    }).sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;