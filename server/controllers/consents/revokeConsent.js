const Consent = require("../../models/consent");

module.exports = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can revoke consents." });
    }

    const { consentId } = req.body;
    if (!consentId) {
      return res.status(400).json({ error: "Consent ID is required." });
    }

    const consent = await Consent.findOne({
      consentId,
      patientId: req.user._id,
    });

    if (!consent) {
      return res.status(404).json({ error: "Consent not found." });
    }

    await Consent.deleteOne({ _id: consent._id });

    return res.json({ success: true });
  } catch (err) {
    console.error("Error revoking consent:", err);
    return res.status(500).json({ error: "Failed to revoke consent." });
  }
};
