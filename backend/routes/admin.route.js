const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Admin = require('../models/admin.model');

router.post('/login', async (req, res) => {
  const { password } = req.body;

  const admin = await Admin.findOne();
  if (!admin) {
    return res.status(500).json({ message: 'Admin not setup' });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  res.json({ success: true });
});

module.exports = router;
