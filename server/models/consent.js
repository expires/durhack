const mongoose = require("mongoose");

const PURPOSES = [
  "care",
  "research",
  "audit",
  "billing",
  "referral",
  "emergency",
  "data_portability",
  "legal",
];

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
      index: true,
    },
    providerId: {
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
    purpose: {
      type: String,
      enum: PURPOSES,
      default: "care",
      required: true,
    },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
    solanaTx: { type: String },
    receiptHash: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("consent", ConsentSchema);
module.exports.PURPOSES = PURPOSES;
