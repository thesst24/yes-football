const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email exists' });

  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hash });

  res.json({ message: 'Register success' });
});

// Login
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
    // 🔥 ดึง user คนแรก (หรือ admin)
  const user = await User.findOne();
  if (!user) return res.status(400).json({ message: 'No user found' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Wrong password' });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token });
});

module.exports = router;
