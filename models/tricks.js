const mongoose = require("mongoose");

const TRICKS_CATEGORY = ["Flat", "Stairs", "Wall", "Grind"];

const trickScheme = mongoose.Schema({
  name: String,
  description: String,
  level: { type: Number, min: 1, max: 3 },
  category: TRICKS_CATEGORY,
});

const Trick = mongoose.model("tricks", trickScheme);

module.exports = Trick;
