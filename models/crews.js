const mongoose = require("mongoose");

const crewsScheme = mongoose.Schema({
  name: String,
  creationDate: Date,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  admins: [String], //uID des admins
});
const Crew = mongoose.model("crews", crewsScheme);

module.exports = Crew;
