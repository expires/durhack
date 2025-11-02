const user = require("../../models/user");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    if (req.user) {
      return res.status(200).send(
        JSON.stringify({
          success: "Authenticated",
          user: {
            id: req.user._id,
            email: req.user.email,
            username: req.user.username,
            name: req.user.name,
            dateOfBirth: req.user.dateOfBirth,
            address: req.user.address,
            role: req.user.role,
          },
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
