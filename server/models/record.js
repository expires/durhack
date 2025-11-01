const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    fileName: { type: String, required: true },
    recordType: { type: String },
    hash: { type: String, required: true },
    solanaTx: { type: String, required: true },
    gcsFileUrl: { type: String, required: true },
    timestamp: { type: String },
    uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("record", recordSchema);
