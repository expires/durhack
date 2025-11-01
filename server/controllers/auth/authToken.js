const user = require("../../models/user");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    if (req.token) {
      return res.status(200).send(
        JSON.stringify({
          success: "Authenticated",
        })
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      JSON.stringify({
        error: "An unexpected error occurred, please try again later.",
      })
    );
  }
};
