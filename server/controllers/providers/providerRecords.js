


const Record = require('../../models/record');
const AccessLog = require('../../models/accessLog');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

function scopesToTypes(scopes) {
  if (scopes.includes('records.read')) return [];
  const map = {
    'labs.read': ['lab'],
    'meds.read': ['med'],
    'imaging.read': ['imaging'],
  };
  return scopes.flatMap(s => map[s] || []);
}

function isTypeAllowed(type, scopes) {
  return scopes.includes('records.read') || scopesToTypes(scopes).includes(type);
}

exports.listRecords = async (req, res) => {
  try {
    const allowedTypes = scopesToTypes(req.scopes);
    const query = { userId: req.patientId };
    if (allowedTypes.length) query.recordType = { $in: allowedTypes };

    const records = await Record.find(query)
      .select('_id recordType fileName uploadedAt solanaTx hash');

    await AccessLog.create({
      providerId: req.provider._id,
      patientId: req.patientId,
      consentId: req.consent.consentId,
      action: 'LIST_RECORDS',
      scopeUsed: req.scopes,
      outcome: 'ALLOW'
    });

    res.json({ records });
  } catch (err) {
    console.error('Error listing records:', err);
    res.status(500).json({ error: 'Failed to list records' });
  }
};

exports.downloadRecord = async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.recordId, userId: req.patientId });
    if (!record) return res.status(404).json({ error: 'Record not found' });

    if (!isTypeAllowed(record.recordType, req.scopes)) {
      await AccessLog.create({
        providerId: req.provider._id,
        patientId: req.patientId,
        consentId: req.consent.consentId,
        action: 'GET_RECORD',
        recordId: record._id,
        scopeUsed: req.scopes,
        outcome: 'DENY'
      });
      return res.status(403).json({ error: 'Scope does not allow this record type' });
    }

    const file = bucket.file(record.gcsObjectPath || record.fileName);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).json({ error: 'File not found in storage' });

    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(record.fileName)}"`);
    const stream = file.createReadStream();
    stream.on('error', err => {
      console.error('GCS stream error:', err);
      res.status(500).json({ error: 'Error streaming file' });
    });
    stream.pipe(res);

    await AccessLog.create({
      providerId: req.provider._id,
      patientId: req.patientId,
      consentId: req.consent.consentId,
      action: 'GET_RECORD',
      recordId: record._id,
      scopeUsed: req.scopes,
      outcome: 'ALLOW'
    });
  } catch (err) {
    console.error('Error downloading record:', err);
    res.status(500).json({ error: 'Failed to download record' });
  }
};