const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const Member = require('../models/member.model');
const MemberCard = require('../models/memberCard.model');
const path = require('path');
const Card = require('../models/memberCard.model');

const phoneRegex = /^\d{10,12}$/;

// multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// CREATE
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { whatsapp } = req.body;

    // 🔹 ตรวจสอบ WhatsApp ซ้ำ
    const exist = await Member.findOne({ whatsapp });
    if (exist) return res.status(400).json({ msg: 'WhatsApp number already exists' });
    // pattern whatsapp
    if (!phoneRegex.test(req.body.whatsapp)) {
      return res.status(400).json({
        message: 'Invalid WhatsApp number'
      });
    }


    const imagePath = req.file ? '/uploads/' + req.file.filename : null;
    const member = new Member({
      ...req.body,
      image: imagePath,
    });

  const savedMember = await member.save();

    // 3. 🔥 สร้าง Card 10 ครั้ง/90 วัน อัตโนมัติ
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90); // บวกเพิ่ม 90 วัน

    const newCard = new MemberCard({
      memberId: savedMember._id,
      totalSessions: 10,
      usedSessions: 0,
      expiryDate: expiry,
      status: 'active'
    });
    await newCard.save();

    res.status(201).json({
      message: 'Member and Training Card created!',
      member: savedMember,
      card: newCard
    });

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// READ
router.get('/', async (req, res) => {
  const members = await Member.find();
  res.json(members);
});

// UPDATE
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const data = { ...req.body };

    // 🔥 ถ้ามีอัปโหลดรูปใหม่
    if (req.file) {
      // 1️⃣ ลบรูปเก่า
      if (member.image) {
        const oldPath = path.join(__dirname, '..', member.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // 2️⃣ เก็บ path รูปใหม่
      data.image = '/uploads/' + req.file.filename;
    }

    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});


// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // 🧨 ลบไฟล์รูป
    if ( member.image &&
  member.image !== "/logo.png" &&
  !member.image.includes("logo.png")) {
      const filePath = path.join(__dirname, '..', member.image);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('❌ Delete image error:', err.message);
        } else {
          console.log('✅ Image deleted:', filePath);
        }
      });
    }
      // 🔥 ลบ Card ก่อน
    await MemberCard.deleteOne({ memberId: member._id });

    // 🧹 ลบ member จาก DB
    await Member.findByIdAndDelete(req.params.id);

    res.json({ message: 'Member + image deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }

});


// router status toggle
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (typeof status !== 'boolean') {
    return res.status(400).json({ error: 'status must be boolean' });
  }
 // ✅ update member
  const member = await Member.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  // ✅ update card ด้วย
  await MemberCard.findOneAndUpdate(
    { memberId: req.params.id },
    { status: status ? "active" : "inactive" }
  );

  
 const updatedCard = await MemberCard.findOneAndUpdate(
  { memberId: req.params.id },
  { status: status ? "active" : "inactive" },
  { new: true }
);

res.json({
  member,
  card: updatedCard
});
});

// MEMBER LOGIN (by whatsapp only)
router.post('/user-login', async (req, res) => {
  try {
    let { whatsapp } = req.body;

    if (!whatsapp) {
      return res.status(400).json({ message: 'Whatsapp is required' });
    }

    whatsapp = whatsapp.trim();

    // 🔐 บังคับขึ้นต้นด้วย 20 และมีตัวเลขอย่างน้อย 9–10 ตัว

    if (!phoneRegex.test(whatsapp)) {
      return res.status(400).json({
        message: 'Invalid WhatsApp format',
      });
    }

    const member = await Member.findOne({ whatsapp });

    if (!member) {
      return res.status(401).json({ message: 'Wrong WhatsApp Number' });
    }

    res.json({
      member,
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.patch("/renew/:memberId", async (req, res) => {
  try {
    const memberId = req.params.memberId;

    // ✅ Update Member Status → Active
    await Member.findByIdAndUpdate(memberId, { status: true });

    // ✅ Reset Card ใหม่ (ใช้ MemberCard)
    const updatedCard = await MemberCard.findOneAndUpdate(
      { memberId },
      {
        usedSessions: 0,
        checkins: [],
        status: "active",
      },
      { new: true }
    );

    res.json({
      message: "✅ Member Renewed Successfully",
      card: updatedCard,
    });

  } catch (err) {
    console.error("Renew Error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


router.post("/trial", async (req, res) => {
  try {

    // ✅ หา Trial ล่าสุด
    const lastTrial = await Member.findOne({ isTrial: true })
      .sort({ createdAt: -1 });

    let nextNumber = 2000000000;

    if (lastTrial && lastTrial.whatsapp) {
      nextNumber = Number(lastTrial.whatsapp) + 1;
    }

    // ✅ สร้าง Member Trial
    const trialMember = await Member.create({
      fullname: `Trial-${nextNumber - 1999999999}`,
      whatsapp: String(nextNumber),
      guardian: "-",
      isTrial: true,
      image: "/uploads/logo.png",
    });

    // ✅🔥 สร้าง Card ให้ Trial ทันที
    const newCard = await Card.create({
      memberId: trialMember._id,
      usedSessions: 0,
      status: "active"
    });

    res.status(201).json({
      message: "✅ Trial Member + Card Created",
      member: trialMember,
      card: newCard
    });

  } catch (err) {
    console.error("❌ Trial Error:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
