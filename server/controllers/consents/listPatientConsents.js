const Consent = require("../../models/consent");
const Record = require("../../models/record");

module.exports = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can view consents." });
    }

    const consents = await Consent.find({ patientId: req.user._id })
      .populate("providerId", "username email role")
      .populate("hospitalId", "username email role")
      .sort({ createdAt: -1 })
      .lean();

    const allRecordIds = consents.flatMap((c) => c.recordIds || []);
    const recordDetails = await Record.find({
      _id: { $in: allRecordIds },
      userId: req.user._id,
    })
      .select("_id fileName recordType solanaTx uploadedAt")
      .lean();

    const recordMap = new Map(
      recordDetails.map((record) => [record._id.toString(), record])
    );

    const formatted = consents.map((consent) => ({
      consentId: consent.consentId,
      provider: consent.providerId
        ? {
            id: consent.providerId._id,
            username: consent.providerId.username,
            email: consent.providerId.email,
            role: consent.providerId.role,
          }
        : consent.hospitalId
        ? {
            id: consent.hospitalId._id,
            username: consent.hospitalId.username,
            email: consent.hospitalId.email,
            role: consent.hospitalId.role,
          }
        : null,
      scopes: consent.scopes,
      purpose: consent.purpose,
      expiresAt: consent.expiresAt,
      revokedAt: consent.revokedAt,
      solanaTx: consent.solanaTx,
      recordIds: consent.recordIds || [],
      records: (consent.recordIds || [])
        .map((id) => recordMap.get(id.toString()))
        .filter(Boolean),
      createdAt: consent.createdAt,
      updatedAt: consent.updatedAt,
    }));

    return res.json({ consents: formatted });
  } catch (err) {
    console.error("Error listing consents:", err);
    return res.status(500).json({ error: "Failed to list consents." });
  }
};
