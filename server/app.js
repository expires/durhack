require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const setJson = require("./middleware/setJson");
const cors = require("cors");

const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
};
const publicDir = __dirname + "/public";

app.use(cors(corsOptions));
app.use(express.json({ limit: "3mb" }));
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: true }));
app.set("json spaces", 2);
app.use(setJson);


app.use("/v1", require("./config/api"));
module.exports = app;
