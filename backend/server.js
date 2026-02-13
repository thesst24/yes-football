const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const memberModel = require('./models/member.model');
const adminRoute = require('./routes/admin.route');
const seasonRoutes = require('./routes/season.route');
const cardRoutes = require('./routes/cards.route');
const sessionRoutes = require('./routes/sessions.route');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/members', require('./routes/member.routes'));
app.use('/api/admin',adminRoute);
app.use('/api/seasons',seasonRoutes);
app.use("/api/attendance", require("./routes/attendance.route"));
app.use("/api/cards", cardRoutes);
app.use('/api/sessions',sessionRoutes);


// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));


app.listen(3000, () => {
  console.log('🚀 Backend running on port 3000');
});

