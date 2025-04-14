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

const trickScheme = mongoose.Schema({
  name: String,
  description: String,
  level: { type: Number, min: 1, max: 3 },
  category: [TRICKS_CATEGORY],
});

const Trick = mongoose.model("tricks", trickScheme);

module.exports = Trick;
