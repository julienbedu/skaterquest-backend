const mongoose = require("mongoose");

const crewsScheme = mongoose.Schema({
  name: String,
  creationDate: Date,
  members: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      admin: Boolean,
    },
  ],
});

const Crew = mongoose.model("crews", crewsScheme);

module.exports = Crew;
