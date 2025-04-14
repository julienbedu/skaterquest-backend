var express = require("express");
const { uploadVideo } = require("../lib/cloudinaryUpload");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const Video = require("../models/videos");
const { getMongoIdMW } = require("../middleware/getMongoId");
const checkBodyMW = require("../middleware/checkBody");
var router = express.Router();

router.post(
  "/",
  checkBodyMW("tricks", "spot"),
  tokenVerifierMW,
  getUserIDMW,
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
  


module.exports = router;
