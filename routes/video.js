var express = require("express");
const { uploadVideo } = require("../lib/cloudinaryUpload");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const Video = require("../models/videos");
const checkBodyMW = require("../middleware/checkBody");
const mongoose = require("mongoose");
const { getUserDataMW } = require("../middleware/getUserData");
const {
  Types: { ObjectId },
} = mongoose; 
var router = express.Router();

router.post(
  "/",
  checkBodyMW("tricks", "spot"),
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
    //get video data
    const { tricks, spot, userData: _id } = req.body;

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
      author: _id,
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
  getUserDataMW(),
  async (req, res) => {
    const videoID = req.params.videoID;
    const { _id: userID } = req.body.userData;

    try {
      const { matchedCount } = await Video.updateOne(
        { videoID },
        {
          $addToSet: { totalVote: userID, weeklyVote: userID },
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

router.put(
  "/unvote/:videoID",
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
    const { videoID } = req.params;
    const { _id: userID } = req.body.userData;

    try {
      const { matchedCount } = await Video.updateOne(
        { videoID },
        {
          $pull: { totalVote: userID, weeklyVote: userID },
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

router.delete(
  "/:videoID",
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
    const { videoID } = req.params;
    const { _id: userID } = req.body.userData;
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
  }
);

module.exports = router;
