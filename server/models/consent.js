const mongoose = require("mongoose");

const ConsentSchema = new mongoose.Schema(
  {
    consentId: { type: String, unique: true, required: true },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    recordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "record",
      },
    ],
    scopes: [{ type: String, required: true }],
    purpose: { type: String, default: "care" },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
    solanaTx: { type: String },
    receiptHash: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("consent", ConsentSchema);
