require("dotenv").config();
require("./models/connection");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fileUpload = require("express-fileupload");

var app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var videoRouter = require("./routes/video");
var spotRouter = require("./routes/spot");
var trickRouter = require("./routes/trick");
var crewRouter = require("./routes/crew");

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/video", videoRouter);
app.use("/spot", spotRouter);
app.use("/trick", trickRouter);
app.use("/crew", crewRouter);

module.exports = app;
