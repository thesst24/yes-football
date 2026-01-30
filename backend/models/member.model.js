const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    image: String,
    fullname: String,
    nickname: String,
    guardian:  String,
    dateOfBirth: Date,
    WhatsApp:Number,
    status: { type: String, default: 'active'}, 
}, { timestamps: true });

module.exports = mongoose.model('Member',memberSchema);