var express = require("express");
var router = express.Router();
const { uploadVideo } = require("../lib/cloudinaryUpload");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const Video = require("../models/videos");
const checkBodyMW = require("../middleware/checkBody");
const mongoose = require("mongoose");
const { getUserDataMW } = require("../middleware/getUserData");
const {
  Types: { ObjectId },
} = mongoose;

/*
Vidéos (`/video`) :
- POST `/` 🔒 PROTEGE  
  Champs obligatoires : `tricks`, `spot` (via `checkBodyMW`).  
  Description : Upload d'une vidéo (liée à un spot et des figures).  
  Réponse :  
  - Succès : `{ result: true, data: video }`  
  - Erreurs : `Database insertion error` (400), échec d'upload Cloudinary (500).

- PUT `/upvote/:videoID` 🔒 PROTEGE  
  Description : Ajouter un vote (upvote) à une vidéo.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `Wrong video ID` (400).

- PUT `/unvote/:videoID` 🔒 PROTEGE  
  Description : Retirer un vote d'une vidéo.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `Wrong video ID` (400).

- DELETE `/:videoID` 🔒 PROTEGE  
  Description : Supprimer une vidéo (réservé au propriétaire).  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `No such video`, `You're not the video owner` (400).

*/

router.post(
  "/",
  checkBodyMW("tricks", "spot"),
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
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
    //A ajouter :
    // update Spot et User pour leur rajouter la vidéo
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
    //A ajouter, enlever la video de Spot et User
    res.json({
      result: true,
    });
  }
);

module.exports = router;
