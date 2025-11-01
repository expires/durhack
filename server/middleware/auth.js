const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN);
    const user = await User.findById(decoded.user_id || decoded._id);
    if (!user) {
      return res.status(404).json({ error: "Patient not found" });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = auth;
