const jwt = require("jsonwebtoken");
const user = require("../models/user");

const auth = async (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN);
    // const getUser = await user.findOne({ token: token });
    // if (!getUser) {
    //   return res
    //     .status(403)
    //     .send(JSON.stringify({ error: "Not Authenticated." }));
    // }
    req.token = decoded;
  } catch (err) {
    return res
      .status(403)
      .send(JSON.stringify({ error: "Not Authenticated." }));
  }
  return next();
};

module.exports = auth;
