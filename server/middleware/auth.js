const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "Not Authenticated." });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN);
    const userId = decoded.user_id || decoded._id;
    if (!userId) {
      return res.status(401).json({ error: "Not Authenticated." });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found." });
    }

    req.token = token;
    req.user = currentUser;
    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = auth;
