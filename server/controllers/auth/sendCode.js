const user = require("../../models/user");
const codes = require("../../models/codes");
const nodemailer = require("nodemailer");
const fs = require("fs");
function generateSixDigitCode() {
  const min = 100000;
  const max = 999999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;

  return code.toString();
}

module.exports = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .send(JSON.stringify({ error: "Please enter your email." }));
    }
    const existsUser = await user.findOne({ email });
    if (!existsUser) {
      return res.status(404).send(JSON.stringify({ error: "User not found." }));
    }

    const sixDigitCode = generateSixDigitCode();
    const expiry = Date.now() + 5 * 60 * 1000;
    codes.createUserOrUpdate(email, sixDigitCode, expiry);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    const mailOptions = {
      from: "your-email@example.com",
      to: email,
      subject: `[${sixDigitCode}] Your Six-Digit Verification Code`,
      html: `
      <!DOCTYPE html>
        <html>
          <head>
            <style>
              @import url("https://fonts.googleapis.com/css2?family=Nunito&display=swap");
              * {
                font-family: "Nunito", sans-serif !important;
              }
              img{
                margin-bottom: 2rem;
              }
              body {
                min-height: 100vh;
                margin: 0;
                padding: 0;
                background-color: #0c1217;
                text-align: left;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .container {
                width: 90%;
              }

              .code {
                border: solid 3px #00ffaa;
                padding: 0rem 2rem;
                border-radius: 20px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img
                src="https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg"
                alt=""
                height="100px"
                style="border-radius: 20px;"
              />
              <h1 style="padding: 0 !important; margin: 0 !important">
                Password Reset
              </h1>

              <h2>
                We have received a request to reset your password. Your security is our
                priority, and we're here to assist you in the process. Below, you will
                find the unique code to reset your password. Please be advised that this
                code is only valid for the next 15 minutes.
              </h2>
              <div class="code">
                <h1>${sixDigitCode}</h1>
              </div>
              <h2>
                If you did not initiate this password reset or believe this is in error,
                please simply ignore this email.
              </h2>
              <h2>
                Thank You <br />
                Devsync
              </h2>
            </div>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .send(JSON.stringify({ error: "Failed to send email." }));
      } else {
        return res
          .status(200)
          .send(JSON.stringify({ success: "Email sent to " + email }));
      }
    });
  } catch (error) {
    return res.status(500).send(
      JSON.stringify({
        error: "An unexpected error occurred, please try again later.",
      })
    );
  }
};
