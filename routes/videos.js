var express = require("express");
const { uploadVideo } = require("../lib/cloudinaryUpload");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const Video = require("../models/videos");
const { getMongoIdMW } = require("../middleware/getMongoId");
const checkBodyMW = require("../middleware/checkBody");
const mongoose = require("mongoose");
const {
  Types: { ObjectId },
} = mongoose; // Import ObjectId
var router = express.Router();

router.post(
  "/",
  checkBodyMW("tricks", "spot"),
  tokenVerifierMW,
  getMongoIdMW,
  async (req, res) => {
    //get video data
    const { tricks, spot, userMongoID } = req.body;

    //upload the video get url
    const { videoFile } = req.files;
    const uploadResult = await uploadVideo(videoFile);
    if (uploadResult.result) {
      res.status(500).json(uploadResult);
      return;
    }
    const { url } = uploadResult;

    const newVideo = new Video({
      creationDate: new Date(),
      url,
      thumbmailURL: "",
      author: userMongoID,
      tricks,
      spot,
    });
    try {
      const data = await newVideo.save();
      res.json({
        result: true,
        data,
      });
    } catch (error) {
      res.status(400).json({
        result: false,
        reason: "Database insertion error",
        error,
      });
    }
  }
);

router.put(
  "/upvote/:videoID",
  tokenVerifierMW,
  getMongoIdMW,
  async (req, res) => {
    const _id = req.params.videoID;
    const { userMongoID } = req.body;
    if (!_id) {
      res.status(400).json({
        result: false,
        reason: "No video ID.",
      });
    }
    try {
      const { matchedCount } = await Video.updateOne(
        { _id },
        {
          $addToSet: { totalVote: userMongoID, weeklyVote: userMongoID },
        }
      );
      console.log(matchedCount, userMongoID);
      matchedCount
        ? res.json({
            result: true,
          })
        : res.status(400).json({
            result: false,
            reason: "Wrong video ID.",
          });
    } catch (error) {
      res.status(400).json({
        result: true,
        reason: "Bad request.",
        error,
      });
    }
  }
);

router.put(
  "/unvote/:videoID",
  tokenVerifierMW,
  getMongoIdMW,
  async (req, res) => {
    const _id = req.params.videoID;
    const { userMongoID } = req.body;
    if (!_id) {
      res.status(400).json({
        result: false,
        reason: "No video ID.",
      });
    }
    try {
      const { matchedCount } = await Video.updateOne(
        { _id },
        {
          $pull: { totalVote: userMongoID, weeklyVote: userMongoID },
        }
      );
      matchedCount
        ? res.json({
            result: true,
          })
        : res.status(400).json({
            result: false,
            reason: "Wrong video ID.",
          });
    } catch (error) {
      res.status(400).json({
        result: true,
        reason: "Bad request.",
        error,
      });
    }
  }
);

router.delete("/:id", tokenVerifierMW, getMongoIdMW, async (req, res) => {
  const videoID = req.params.id;
  const userID = req.body.userMongoID;
  const video = await Video.findOne({
    _id: videoID,
  });
  if (!video) {
    res.json({
      result: false,
      reason: "No such video.",
    });
    return;
  }
  if (video.author.toString() != userID) {
    res.json({
      result: false,
      reason: "You're not the video owner.",
    });
    return;
  }
  await Video.deleteOne({ _id: videoID });
  res.json({
    result: true,
  });
});

module.exports = router;
