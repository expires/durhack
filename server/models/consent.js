

const mongoose = require('mongoose');

const ConsentSchema = new mongoose.Schema({
  consentId: { type: String, unique: true, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  scopes: [{ type: String, required: true }],
  purpose: { type: String, default: 'care' },
  expiresAt: { type: Date },
  revokedAt: { type: Date },
  solanaTx: { type: String }, // Solana transaction hash for consent receipt
  receiptHash: { type: String }, // SHA-256 hash of the consent receipt JSON
}, { timestamps: true });

module.exports = mongoose.model('Consent', ConsentSchema);