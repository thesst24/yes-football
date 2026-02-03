const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    image: String,
    fullname: String,
    nickname: String,
    guardian:  String,
    dateOfBirth: Date,
    whatsapp: Number,
    status: { type: Boolean, default: true},  
}, { timestamps: true });

module.exports = mongoose.model('Member',memberSchema);