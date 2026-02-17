const express = require("express");
const router = express.Router();

const Member = require("../models/member.model");
const MemberCard = require("../models/memberCard.model");

router.get("/monthly", async (req, res) => {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  // ✅ New Members
  const newMembers = await Member.countDocuments({
    createdAt: { $gte: start, $lt: end },
    isTrial: false
  });

  // ✅ Renew Members (เฉพาะ renewedAt != null)
  const renewedMembers = await MemberCard.countDocuments({
    renewedAt: { $ne: null },
    renewedAt: { $gte: start, $lt: end }
  });

  res.json({
    newMembers,
    renewedMembers,
    totalGrowth: newMembers + renewedMembers,
  });
});

module.exports = router;