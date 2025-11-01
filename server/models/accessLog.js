const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  at: { type: Date, default: Date.now, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  consentId: { type: String },
  action: { type: String, required: true }, // e.g., LIST_RECORDS, GET_RECORD
  recordId: { type: String },
  scopeUsed: [{ type: String }],
  outcome: { type: String, enum: ['ALLOW', 'DENY'], required: true }
});

module.exports = mongoose.model('AccessLog', AccessLogSchema);
