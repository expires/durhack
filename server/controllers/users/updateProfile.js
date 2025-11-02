const User = require("../../models/user");

module.exports = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated." });
    }

    if (req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can update this profile." });
    }

    const { name, dateOfBirth, address } = req.body;

    if (!name || !dateOfBirth || !address) {
      return res
        .status(400)
        .json({ error: "Name, date of birth, and address are required." });
    }

    const parsedDob = new Date(dateOfBirth);
    if (Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({ error: "Invalid date of birth." });
    }

    req.user.name = name;
    req.user.dateOfBirth = parsedDob;
    req.user.address = address;

    await req.user.save();

    return res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        name: req.user.name,
        dateOfBirth: req.user.dateOfBirth,
        address: req.user.address,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ error: "Failed to update profile." });
  }
};
