const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const Member = require('../models/member.model');
const path = require('path');

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
  const imagePath = req.file ? '/uploads/' + req.file.filename : null;
  const member = new Member({
    image: req.file?.filename,
    ...req.body,
    image: imagePath
  });
  await member.save();
  res.json(member);
});

// READ
router.get('/', async (req, res) => {
  const members = await Member.find();
  res.json(members);
});

// UPDATE
router.put('/:id', upload.single('image'), async (req, res) => {
  const data = { ...req.body };

  if (req.file) {
    data.image = '/uploads/' + req.file.filename; // ⭐ สำคัญ
  }

  const member = await Member.findByIdAndUpdate(
    req.params.id,
    data,
    { new: true }
  );

  res.json(member);
});


// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // 🧨 ลบไฟล์รูป
    if (member.image) {
      const filePath = path.join(__dirname, '..', member.image);
      // ตัวอย่าง: backend/uploads/xxx.jpg

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('❌ Delete image error:', err.message);
        } else {
          console.log('✅ Image deleted:', filePath);
        }
      });
    }



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

  const member = await Member.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(member);
});



module.exports = router;
