const User = require("../../models/user");

module.exports = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res
        .status(403)
        .json({ error: "Only patients can view providers." });
    }

    const providers = await User.find({ role: { $in: ["hospital", "doctor", "researcher"] } })
      .select("_id username email role")
      .sort({ username: 1 })
      .lean();

    return res.json({
      providers: providers.map((provider) => ({
        id: provider._id,
        username: provider.username,
        email: provider.email,
        role: provider.role,
      })),
    });
  } catch (err) {
    console.error("Error listing providers:", err);
    return res.status(500).json({ error: "Failed to list providers." });
  }
};
