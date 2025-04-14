const mongoose = require("mongoose");

const spotsScheme = mongoose.Schema({
  creationDate: Date,
  name: String,
  localisation: {
    lat: Number,
    lon: Number,
  },
  category: ["street", "park", "flat"],
  img: [String],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  leaderboard: {
    alltime: { type: mongoose.Schema.Types.ObjectId, ref: "videos" },
    week: { type: mongoose.Schema.Types.ObjectId, ref: "videos" },
  },
  videos: { type: mongoose.Schema.Types.ObjectId, ref: "videos" },
});

const Spot = mongoose.model("spots", spotsScheme);

module.exports = Spot;
