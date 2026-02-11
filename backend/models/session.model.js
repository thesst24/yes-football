const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  seasonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Season', 
    required: true 
  },
  name: String,       // เช่น "ครั้งที่ 1"
  date: Date,         // วันที่ซ้อมจริง
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  attendance: [String] // เก็บ ID นักกีฬาที่เช็คชื่อแล้ว
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);