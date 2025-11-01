const mongoose = require("mongoose");

const { mongoURI } = process.env;

exports.connect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((error) => {
      console.log("Database connection failed. Terminating now...");
      console.error(error);
      process.exit(1);
    });
};
