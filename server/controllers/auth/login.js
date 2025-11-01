const user = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    const { username, password, stayLoggedIn } = req.body;
    if (!(username && password)) {
      return res
        .status(400)
        .send(
          JSON.stringify({ error: "Please provide all required information." })
        );
    }

    const usernameSearch = username.toLowerCase();
    const existsUser = await user.findOne({ username: usernameSearch });
    if (!existsUser) {
      return res
        .status(400)
        .send(JSON.stringify({ error: "Invalid username or password." }));
    }

    let isPassTrue = await bcrypt.compare(password, existsUser.password);
    if (isPassTrue) {
      let expiry = "15m";
      if (stayLoggedIn) {
        expiry = "30d";
      }
      let token;
      token = jwt.sign({ user_id: existsUser._id }, process.env.TOKEN, {
        expiresIn: expiry,
      });
      return res.status(200).send(
        JSON.stringify({
          success: { success: "Successfully logged in." },
          token: token,
        })
      );
    } else {
      return res
        .status(400)
        .send(JSON.stringify({ error: "Invalid username or password." }));
    }
  } catch (error) {
    return res.status(500).send(
      JSON.stringify({
        error: "An unexpected error occurred, please try again later.",
      })
    );
  }
};
