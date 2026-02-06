const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    memberId: String,
    seasonId: String,
    total: 10,
    used: 0,
    expiredAt: Date,
    status: String
})

module.exports = mongoose.model('Card',cardSchema);