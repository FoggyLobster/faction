
const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    robloxId: {
        type: String,
        required: true,
        index: true
    },
    robloxUsername: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    verifiedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Verification", verificationSchema);
