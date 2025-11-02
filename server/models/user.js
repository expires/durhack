const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String },
    dateOfBirth: { type: Date },
    address: { type: String },
    role: {
      type: String,
      enum: [
        "patient",
        "hospital",
        "doctor",
        "researcher",
        "auditor",
        "insurance",
        "emergency",
      ],
      default: "patient",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
