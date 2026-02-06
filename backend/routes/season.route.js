const express = require('express');
const router = express.Router();

const Season = require('../models/season.model');
const Session = require('../models/session.model');

// CREATE SEASON
router.post('/', async (req, res) => {
  try {
    const { name, startDate } = req.body;

    if (!name || !startDate) {
      return res.status(400).json({ message: 'name & startDate required' });
    }

    // 1️⃣ Create Season
    const season = await Season.create({
      name,
      startDate,
      endDate: new Date(
        new Date(startDate).setDate(new Date(startDate).getDate() + 45)
      ) // 15 sessions ~ 5 weeks
    });

    // 2️⃣ Auto create 15 Sessions
    const sessions = [];

    for (let i = 0; i < 15; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + i * 3); // ทุก ~3 วัน

      sessions.push({
        seasonId: season._id,
        name: `session${i + 1}`,
        date: sessionDate
      });
    }

    await Session.insertMany(sessions);

    res.json({
      message: 'Season created',
      season,
      sessionsCount: sessions.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
