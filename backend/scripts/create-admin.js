const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin.model');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URL);

  const count = await Admin.countDocuments();
  if (count > 0) {
    console.log('Admin already exists');
    process.exit();
  }

  const hash = await bcrypt.hash('admin1234', 10);

  await Admin.create({ password: hash });
  console.log('Admin created');
  process.exit();
})();
