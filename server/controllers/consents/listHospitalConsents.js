const Consent = require("../../models/consent");
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
    if (
      !req.user ||
      !["hospital", "doctor", "researcher", "auditor", "insurance", "emergency"].includes(
        req.user.role
      )
    ) {
      return res
        .status(403)
        .json({ error: "Only providers can view authorized patients." });
    }

    const consents = await Consent.find({
      $or: [{ providerId: req.user._id }, { hospitalId: req.user._id }],
    })
      .populate("patientId", "username email role")
      .sort({ createdAt: -1 })
      .lean();

    const allRecordIds = consents.flatMap((consent) => consent.recordIds || []);
    const records = await Record.find({
      _id: { $in: allRecordIds },
    })
      .select("_id fileName recordType solanaTx gcsFileUrl uploadedAt userId")
      .lean();

    const recordMap = new Map(
      records.map((record) => [record._id.toString(), record])
    );

    const response = [];
    for (const consent of consents) {
      const patient = consent.patientId
        ? {
            id: consent.patientId._id,
            username: consent.patientId.username,
            email: consent.patientId.email,
          }
        : null;

      const recordDetails = [];
      for (const recordId of consent.recordIds || []) {
        const record = recordMap.get(recordId.toString());
        if (record) {
          const downloadUrl = await buildSignedUrl(record.gcsFileUrl);
          recordDetails.push({
            id: record._id,
            fileName: record.fileName,
            recordType: record.recordType,
            solanaTx: record.solanaTx,
            uploadedAt: record.uploadedAt,
            downloadUrl,
          });
        }
      }

      response.push({
        consentId: consent.consentId,
        patient,
        scopes: consent.scopes,
        purpose: consent.purpose,
        expiresAt: consent.expiresAt,
        revokedAt: consent.revokedAt,
        solanaTx: consent.solanaTx,
        records: recordDetails,
        createdAt: consent.createdAt,
      });
    }

    return res.json({ patients: response });
  } catch (err) {
    console.error("Error listing provider consents:", err);
    return res.status(500).json({ error: "Failed to list provider consents." });
  }
};
