const express = require("express");
const router = express.Router();

const Member = require("../models/member.model");
const MemberCard = require("../models/memberCard.model");



router.get("/monthly", async (req, res) => {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  // ✅ เดือนก่อน
  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 1);

  // ==========================
  // ✅ New Members
  // ==========================
  const newMembers = await Member.countDocuments({
    createdAt: { $gte: start, $lt: end },
    isTrial: false
  });

  // ==========================
  // ✅ Renewed Members
  // ==========================
  const renewedMembers = await MemberCard.countDocuments({
    renewedAt: { $gte: start, $lt: end }
  });

  // ==========================
  // ✅ Total Members
  // ==========================
  const totalMembers = await Member.countDocuments({
    isTrial: false
  });

  // ==========================
  // ✅ Active / Inactive
  // ==========================
  const activeMembers = await Member.countDocuments({
    status: true,
    isTrial: false
  });

  const inactiveMembers = await Member.countDocuments({
    status: false,
    isTrial: false
  });

  // ==========================
  // ✅ Compare Last Month Growth
  // ==========================
  const lastMonthNew = await Member.countDocuments({
    createdAt: { $gte: prevStart, $lt: prevEnd },
    isTrial: false
  });

  const lastMonthRenew = await MemberCard.countDocuments({
    renewedAt: { $gte: prevStart, $lt: prevEnd }
  });

  const lastMonthGrowth = lastMonthNew + lastMonthRenew;
  const thisMonthGrowth = newMembers + renewedMembers;

  const growthDiff = thisMonthGrowth - lastMonthGrowth;

  res.json({
    year,
    month,

    newMembers,
    renewedMembers,
    totalGrowth: thisMonthGrowth,

    totalMembers,
    activeMembers,
    inactiveMembers,

    lastMonthGrowth,
    growthDiff
  });
});

module.exports = router;