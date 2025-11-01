

const jwt = require('jsonwebtoken');
const Consent = require('../models/consent');
const Provider = require('../models/provider');

module.exports = async function requireProviderToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const claims = jwt.verify(token, process.env.PROVIDER_TOKEN_SECRET, { audience: 'records-api' });
    const providerId = claims.sub?.replace('provider:', '');
    const patientId = claims.patient_id;
    const consentId = claims.consent_id;

    if (!providerId || !patientId || !consentId) {
      return res.status(400).json({ error: 'Invalid token claims' });
    }

    const provider = await Provider.findById(providerId);
    if (!provider || !provider.active) {
      return res.status(403).json({ error: 'Inactive or unknown provider' });
    }

    const consent = await Consent.findOne({ consentId, providerId, patientId });
    if (!consent) return res.status(403).json({ error: 'Consent not found' });
    if (consent.revokedAt) return res.status(403).json({ error: 'Consent revoked' });
    if (consent.expiresAt && consent.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Consent expired' });
    }

    req.provider = provider;
    req.patientId = patientId;
    req.scopes = (claims.scope || '').split(' ').filter(Boolean);
    req.consent = consent;

    next();
  } catch (err) {
    console.error('Provider token verification error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};