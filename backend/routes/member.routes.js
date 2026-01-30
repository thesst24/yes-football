const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const Member = require('../models/member.model');

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
  if (req.file) data.image = req.file.filename;

  const member = await Member.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(member);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
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
