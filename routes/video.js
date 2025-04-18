const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const { uploadVideo } = require("../lib/cloudinaryUpload");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const Video = require("../models/videos");
const checkBodyMW = require("../middleware/checkBody");

const { getUserDataMW } = require("../middleware/getUserData");
const Spot = require("../models/spots");
const User = require("../models/users");

/*
### Video (/video)
- POST / 🔒 PROTEGE 📤 FICHIER  
  *Champs obligatoires : `tricks`, `spot`*  
  *Description* : Upload d'une vidéo liée à un spot et des figures.  
  *Réponse* :  
  - Succès : `{ result: true, data: video }`  
  - Erreurs : `400` (erreur base de données), `500` (échec Cloudinary).  

- PUT /upvote/:videoID 🔒 PROTEGE  
  *Description* : Ajouter un upvote à une vidéo.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (ID incorrect).  

- PUT /unvote/:videoID 🔒 PROTEGE  
  *Description* : Retirer un vote d'une vidéo.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `400` (ID incorrect).  

- DELETE /:videoID 🔒 PROTEGE  
  *Description* : Supprimer une vidéo (réservé au propriétaire).  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreurs : `400` (vidéo inexistante, utilisateur non propriétaire).  

---
*/

router.post(
  "/",
  fileUpload(),
  checkBodyMW("tricks", "spot"),
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
    const { tricks, spot, userData } = req.body;
    //upload the video get url
    const { videoFile } = req.files;
    const uploadResult = await uploadVideo(videoFile);
    console.log(uploadResult);
    if (!uploadResult.result) {
      res.status(500).json(uploadResult);
      return;
    }
    const { url } = uploadResult;

    const newVideo = new Video({
      creationDate: new Date(),
      url,
      thumbnailURL: "",
      author: userData._id,
      tricks,
      spot,
    });
    try {
      //Insert la vidéo et l'ajoute au spot et à l'utilisateur
      await newVideo.save();
      await Spot.updateOne(
        { _id: spot },
        { $addToSet: { videos: newVideo._id } }
      );
      await User.updateOne(
        { _id: userData._id },
        { $addToSet: { videos: newVideo._id } }
      );
      res.json({
        result: true,
        data: newVideo,
      });
    } catch (error) {
      res.status(400).json({
        result: false,
        reason: "Database insertion error : video",
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
    const { userData } = req.body;
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

    if (video.author.toString() != userData._id) {
      res.json({
        result: false,
        reason: "You're not the video owner.",
      });
      return;
    }
    try {
      //Suprime la video et la retire de User et de Spot
      await Video.deleteOne({ _id: videoID });
      await Spot.updateOne({ _id: video.spot }, { $pull: { videos: videoID } });
      await User.updateOne(
        { _id: userData._id },
        { $pull: { videos: videoID } }
      );
      res.json({
        result: true,
      });
    } catch (error) {
      res.json({
        result: false,
        reason: "Database deletion error : video",
        error,
      });
    }
  }
);

module.exports = router;
