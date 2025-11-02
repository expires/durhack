const Consent = require("../../models/consent");
const User = require("../../models/user");
const Record = require("../../models/record");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

const buildSignedUrl = async (gcsUrl) => {
  if (!gcsUrl) return null;
  const fileName = gcsUrl.replace(`gs://${process.env.GOOGLE_BUCKET_NAME}/`, "");
  const file = bucket.file(fileName);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
  });
  return url;
};

module.exports = async (req, res) => {
  try {
    if (!req.user || !["hospital", "doctor", "researcher"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only providers can view this dashboard." });
    }

    const consents = await Consent.find({
      $or: [{ providerId: req.user._id }, { hospitalId: req.user._id }],
      revokedAt: { $exists: false },
    }).lean();

    const patientIds = [...new Set(consents.map((c) => c.patientId.toString()))];

    const patients = await User.find({ _id: { $in: patientIds } })
      .select("_id username email")
      .lean();

    const records = await Record.find({ userId: { $in: patientIds } })
      .lean();

    const recordMap = new Map();
    for (const record of records) {
      if (!recordMap.has(record.userId.toString())) {
        recordMap.set(record.userId.toString(), []);
      }
      recordMap.get(record.userId.toString()).push(record);
    }

    const grouped = await Promise.all(
      patients.map(async (patient) => {
        const patientRecords = recordMap.get(patient._id.toString()) || [];
        const withUrls = await Promise.all(
          patientRecords.map(async (record) => ({
            _id: record._id,
            fileName: record.fileName,
            recordType: record.recordType,
            uploadedAt: record.uploadedAt,
            downloadUrl: await buildSignedUrl(record.gcsFileUrl),
          }))
        );

        return {
          _id: patient._id,
          name: patient.username,
          email: patient.email,
          records: withUrls,
        };
      })
    );

    return res.json({ patients: grouped });
  } catch (err) {
    console.error("Error building hospital dashboard:", err);
    return res.status(500).json({ error: "Failed to load hospital dashboard." });
  }
};
