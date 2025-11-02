const User = require("../../models/user");

module.exports = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res
        .status(403)
        .json({ error: "Only patients can view hospitals." });
    }

    const hospitals = await User.find({ role: "hospital" })
      .select("_id username email")
      .sort({ username: 1 })
      .lean();

    return res.json({
      hospitals: hospitals.map((hospital) => ({
        id: hospital._id,
        username: hospital.username,
        email: hospital.email,
      })),
    });
  } catch (err) {
    console.error("Error listing hospitals:", err);
    return res.status(500).json({ error: "Failed to list hospitals." });
  }
};
