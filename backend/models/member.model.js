const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    image: String,
    fullname: String,
    nickname: String,
    guardian:  String,
    dateOfBirth: Date,
    whatsapp: Number,
    status: { type: Boolean, default: true},  
    checkins: [
        {
            date: Date,
            order: Number
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Member',memberSchema);