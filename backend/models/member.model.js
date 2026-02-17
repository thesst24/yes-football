const mongoose = require('mongoose');


const memberSchema = new mongoose.Schema({
  image: {
  type: String,
  default: "/uploads/logo.png"
},
  fullname: { type: String, required: true },
  nickname: String,
  guardian: {
    type: String,
    default: "-"
  },
  dateOfBirth: Date,
  whatsapp: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
  isTrial: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
