const user = require("../../models/user");
const codes = require("../../models/codes");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (!(email && code && password)) {
      return res
        .status(400)
        .send(
          JSON.stringify({ error: "Please provide all required information." })
        );
    }
    userCode = codes.findUserByEmail(email);
    const updateUser = await user.findOne({ email: email });
    if (
      userCode === undefined ||
      userCode.expiration < Date.now() ||
      userCode.code != code
    ) {
      return res.status(401).send(JSON.stringify({ error: "Invalid Code." }));
    }

    let encryptedPassword = await bcrypt.hash(password, 10);
    updateUser.password = encryptedPassword;
    await updateUser.save();
    codes.deleteUserByEmail(email);
    return res
      .status(200)
      .send(JSON.stringify({ success: "Successfully reset password" }));
  } catch (error) {
    console.error(error);
    return res.status(500).send(
      JSON.stringify({
        error: "An unexpected error occurred, please try again later.",
      })
    );
  }
};
