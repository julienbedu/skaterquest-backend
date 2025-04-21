const mongoose = require("mongoose");

const videosScheme = mongoose.Schema({
  creationDate: Date,
  url: String,
  thumbnailURL: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  tricks: [String],
  spot: { type: mongoose.Schema.Types.ObjectId, ref: "spots" },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  voteCount: { type: Number, default: 0 },
});

videosScheme.post("findOneAndUpdate", async function (doc) {
  console.log(doc);
  doc.voteCount = doc.votes.length;
  await doc.save();
});
const Video = mongoose.model("videos", videosScheme);

module.exports = Video;
