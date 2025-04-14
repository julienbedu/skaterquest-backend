const mongoose = require("mongoose");

const crewsScheme = mongoose.Schema({
  name: String,
  creationDate: Date,
  members: [
{ type: mongoose.Schema.Types.ObjectId, ref: "users" }
  ],
});

const Crew = mongoose.model("crews", crewsScheme);

module.exports = Crew;
