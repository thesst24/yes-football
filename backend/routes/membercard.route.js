const express = require("express");
const router = express.Router();

const MemberCard = require("../models/memberCard.model");

// Renew card
router.post("/renew", async (req, res) => {
  try {
    const { memberId } = req.body;

    // ปิด card เก่า
    await MemberCard.updateMany(
      { memberId },
      { status: "inactive" }
    );

    // สร้างใหม่
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90);

    const newCard = await MemberCard.create({
      memberId,
      totalSessions: 10,
      usedSessions: 0,
      expiryDate: expiry,
      status: "active",
    });

    res.json({
      message: "Renew card สำเร็จ",
      card: newCard,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET card ของ member
router.get("/member/:id", async (req, res) => {
  try {
    const card = await MemberCard.findOne({
      memberId: req.params.id,
      status: "active",
    });

    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;