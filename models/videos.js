const mongoose = require("mongoose");

const videosScheme = mongoose.Schema({
  creationDate: Date,
  url: String,
  thumbmailURL: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  tricks: [{ type: mongoose.Schema.Types.ObjectId, ref: "tricks" }],
  spot: { type: mongoose.Schema.Types.ObjectId, ref: "spots" },
  totalVote: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  weeklyVote: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

const Video = mongoose.model("videos", videosScheme);

module.exports = Video;
