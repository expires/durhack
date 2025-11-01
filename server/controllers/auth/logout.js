const user = require("../../models/user");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    const token = req.token;
    // TOKEN LOGIC GOES HERE
    return res.status(200).send(
      JSON.stringify({
        success: "You have successfully been logged out.",
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      JSON.stringify({
        error: "An unexpected error occurred, please try again later.",
      })
    );
  }
};
