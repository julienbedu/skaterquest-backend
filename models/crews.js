const mongoose = require("mongoose");

const crewsScheme = mongoose.Schema({
  name: String,
  creationDate: Date,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});
//a rajouter admins (juste uID pour comparer).
const Crew = mongoose.model("crews", crewsScheme);

module.exports = Crew;
