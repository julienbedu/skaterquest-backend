const mongoose = require("mongoose");

const TRICKS_CATEGORY = [
  "NOLLIE",
  "FACKIE",
  "SWITCH",
  "SHUVIT",
  "360-SHUVIT",
  "180",
  "360",
  "OLD SCHOOL",
  "GAP",
  "KICKFLIP",
  "HEELFLIP",
];

const tricksScheme = mongoose.Schema({
  name: String,
  description: String,
  level: { type: Number, min: 1, max: 3 },
  categorie: [TRICKS_CATEGORY],
});

const Trick = mongoose.model("tricks", tricksScheme);

module.exports = Trick;
