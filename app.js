//Import du .env et connexion à la base de données
require("dotenv").config();
require("./models/connection");

//Import d'express et ses middlewares
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
// const fileUpload = require("express-fileupload");

var app = express();

//Middleware globaux (sur toutes les routes)
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Imports des routes
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
