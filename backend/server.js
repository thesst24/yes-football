const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const memberModel = require('./models/member.model');
const Participant = require('./models/participant.model.js');
const Session = require('./models/session.model.js');
const adminRoute = require('./routes/admin.route');
const seasonRoutes = require('./routes/season.route');
const cardRoutes = require('./routes/cards.route');
const sessionRoutes = require('./routes/sessions.route');
const participants = require('./routes/participants.route.js');
const reportRoute = require('./routes/report.route.js');
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
app.use("/api/participants", participants);
app.use('/api/report',reportRoute);
app.use("/api/settings", require("./routes/setting.routes.js"));
app.use("/uploads", express.static("uploads"));



// รันทุกวัน 23:59:59 เวลา Laos
cron.schedule("59 59 23 * * *", async () => {
  console.log("⏰ Running 23:59:59 session auto-complete");
  await autoCompleteSessions();
}, {
  timezone: "Asia/Vientiane"
});

// update status participant pending => absent
cron.schedule("0 1 * * *", async () => {
  console.log("Running Absent Auto Update...");

  const today = new Date();
  today.setHours(0,0,0,0);

  const pastSessions = await Session.find({
    date: { $lt: today }
  });

  for (const session of pastSessions) {
    await Participant.updateMany(
      {
        sessionId: session._id,
        status: "pending"
      },
      { status: "absent" }
    );
  }

  console.log("Absent Updated.");
});

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));


app.listen(3000, () => {
  console.log('🚀 Backend running on port 3000');
});

