const Consent = require("../../models/consent");
const User = require("../../models/user");

module.exports = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated." });
    }

    const consents = await Consent.find({ patientId: req.user._id })
      .populate("providerId", "username")
      .populate("hospitalId", "username")
      .sort({ createdAt: -1 })
      .lean();

    const timeline = consents.map((consent) => {
      const providerName =
        consent.providerId?.username || consent.hospitalId?.username || "Unknown";

      return {
        _id: consent._id,
        providerName,
        purpose: consent.purpose,
        type: consent.revokedAt ? "revoke" : "create",
        date: consent.revokedAt || consent.createdAt,
        solanaTx: consent.solanaTx,
      };
    });

    return res.json({ timeline });
  } catch (err) {
    console.error("Error building consent timeline:", err);
    return res.status(500).json({ error: "Failed to load timeline." });
  }
};
