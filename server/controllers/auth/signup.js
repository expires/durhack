const user = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkEmail = require("../../utils/validation/checkEmail");
const checkUsername = require("../../utils/validation/checkUsername");

module.exports = async (req, res) => {
  try {
    const { email, username, password, role = "patient" } = req.body;
    const usernameLow = username.toLowerCase();

    if (!(email && username && password)) {
      return res
        .status(400)
        .send(
          JSON.stringify({ error: "Please provide all required information." })
        );
    } else if (!["patient", "hospital"].includes(role)) {
      return res
        .status(400)
        .send(JSON.stringify({ error: "Invalid user role supplied." }));
    } else if (!checkEmail(email) || !checkUsername(username)) {
      return res
        .status(400)
        .send(JSON.stringify({ error: "Invalid username or email." }));
    } else if (
      usernameLow == "signup" ||
      usernameLow == "login" ||
      usernameLow == "reset" ||
      usernameLow == "dashboard"
    ) {
      return res
        .status(400)
        .send(JSON.stringify({ error: "Username is unavailable" }));
    }

    const existsEmail = await user.findOne({ email });
    const existsUsername = await user.findOne({ username });
    if (existsEmail || existsUsername) {
      return res.status(409).send(
        JSON.stringify({
          error: "An account with this Username or Email already exists.",
        })
      );
    }

    let encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = await user.create({
      email: email.toLowerCase(),
      username: usernameLow,
      password: encryptedPassword,
      role,
      profilePicture: "./src/assets/images/logo.png",
      displayName: usernameLow,
      aboutMe: "",
      socials: [],
      skills: [],
      projects: [],
    });
    const token = jwt.sign({ user_id: newUser._id }, process.env.TOKEN, {
      expiresIn: "1h",
    });
    return res.status(201).send(
      JSON.stringify({
        success: { success: "Successfully registered." },
        token: token,
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
        },
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send(
      JSON.stringify({
        error: "An unexpected error occurred, please try again later.",
      })
    );
  }
};
