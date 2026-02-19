const express = require("express");
const router = express.Router();

const Member = require("../models/member.model");
const MemberCard = require("../models/memberCard.model");
const ExcelJS = require('exceljs');


router.get("/monthly", async (req, res) => {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 1);

  // ✅ New Members
  const newMembers = await Member.countDocuments({
    createdAt: { $gte: start, $lt: end },
    isTrial: false
  });

  // ✅ Renew Count This Month
  const renewAgg = await MemberCard.aggregate([
    { $unwind: "$renewHistory" },
    {
      $match: {
        "renewHistory.date": { $gte: start, $lt: end }
      }
    },
    { $count: "total" }
  ]);

  const renewCount =
    renewAgg.length > 0 ? renewAgg[0].total : 0;

  // ✅ Total Members
  const totalMembers = await Member.countDocuments({
    isTrial: false
  });

  // ✅ Active / Inactive
  const activeMembers = await Member.countDocuments({
    status: true,
    isTrial: false
  });

  const inactiveMembers = await Member.countDocuments({
    status: false,
    isTrial: false
  });

  // ✅ Last Month Renew Count
  const lastRenewAgg = await MemberCard.aggregate([
    { $unwind: "$renewHistory" },
    {
      $match: {
        "renewHistory.date": { $gte: prevStart, $lt: prevEnd }
      }
    },
    { $count: "total" }
  ]);

  const lastMonthRenew =
    lastRenewAgg.length > 0 ? lastRenewAgg[0].total : 0;

  // ✅ Last Month New
  const lastMonthNew = await Member.countDocuments({
    createdAt: { $gte: prevStart, $lt: prevEnd },
    isTrial: false
  });

  // ✅ Growth Compare
  const lastMonthGrowth = lastMonthNew + lastMonthRenew;
  const thisMonthGrowth = newMembers + renewCount;

  const growthDiff = thisMonthGrowth - lastMonthGrowth;

  res.json({
    year,
    month,

    newMembers,
    renewedMembers: renewCount,
    totalGrowth: thisMonthGrowth,

    totalMembers,
    activeMembers,
    inactiveMembers,

    lastMonthGrowth,
    growthDiff
  });
});


router.get("/yearly", async (req, res) => {
  const year = parseInt(req.query.year);

  const start = new Date(year, 0, 1);       // Jan 1
  const end = new Date(year + 1, 0, 1);     // Jan 1 next year

  // ==========================
  // ✅ New Members (ทั้งปี)
  // ==========================
  const newMembers = await Member.countDocuments({
    createdAt: { $gte: start, $lt: end },
    isTrial: false
  });

  // ==========================
  // ✅ Renewed Members (ทั้งปี)
  // ==========================
  const renewAgg = await MemberCard.aggregate([
    { $unwind: "$renewHistory" },
    {
      $match: {
        "renewHistory.date": { $gte: start, $lt: end }
      }
    },
    { $count: "total" }
  ]);

  const renewedMembers =
    renewAgg.length > 0 ? renewAgg[0].total : 0;

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
  // ✅ Total Growth
  // ==========================
  const totalGrowth = newMembers + renewedMembers;

  res.json({
    year,
    newMembers,
    renewedMembers,
    totalGrowth,
    totalMembers,
    activeMembers,
    inactiveMembers
  });
});

module.exports = router;