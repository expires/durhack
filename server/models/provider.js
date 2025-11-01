

const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  orgId: { type: String, required: true }, // e.g., organization code or unique identifier
  email: { type: String, required: true, unique: true },
  apiClientId: { type: String, unique: true },
  apiClientSecretHash: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Provider', ProviderSchema);