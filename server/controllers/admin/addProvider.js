const user = require("../../models/user");
const bcrypt = require("bcrypt");
const checkEmail = require("../../utils/validation/checkEmail");
const checkUsername = require("../../utils/validation/checkUsername");

const ALLOWED_PROVIDER_ROLES = [
  "hospital",
  "doctor",
  "researcher",
  "auditor",
  "insurance",
  "emergency",
];

const createProviderHandler = (providerRole = "hospital") => {
  const normalizedRole = providerRole.toLowerCase();
  if (!ALLOWED_PROVIDER_ROLES.includes(normalizedRole)) {
    throw new Error(`Unsupported provider role: ${providerRole}`);
  }

  return async (req, res) => {
    try {
      const adminPassword = req.body.adminPassword;
      if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ error: "Invalid admin credentials." });
      }

      const { email, username, password, name } = req.body;
      if (!(email && username && password && name)) {
        return res.status(400).json({
          error: "Email, username, password, and name are required.",
        });
      }

      if (!checkEmail(email) || !checkUsername(username)) {
        return res
          .status(400)
          .json({ error: "Invalid username or email." });
      }

      const existsEmail = await user.findOne({ email: email.toLowerCase() });
      const existsUsername = await user.findOne({
        username: username.toLowerCase(),
      });
      if (existsEmail || existsUsername) {
        return res.status(409).json({
          error: "A provider with this username or email already exists.",
        });
      }

      const encryptedPassword = await bcrypt.hash(password, 10);
      const provider = await user.create({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: encryptedPassword,
        role: normalizedRole,
        name,
      });

      return res.status(201).json({
        success: true,
        provider: {
          id: provider._id,
          email: provider.email,
          username: provider.username,
          name: provider.name,
          role: provider.role,
        },
      });
    } catch (err) {
      console.error("Add provider error:", err);
      return res.status(500).json({ error: "Failed to create provider." });
    }
  };
};

module.exports = {
  createProviderHandler,
  ALLOWED_PROVIDER_ROLES,
};
