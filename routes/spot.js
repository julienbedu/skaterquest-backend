const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const { tokenVerifierMW } = require("../middleware/tokenAuth");
const checkBodyMW = require("../middleware/checkBody");
const Spot = require("../models/spots");
const { populateSpot } = require("../models/pipelines/population");
const { getUserDataMW } = require("../middleware/getUserData");
const { aggregateSpotByLocation } = require("../models/pipelines/aggregation");
const { uploadImage } = require("../lib/cloudinaryUpload");

/*
### Spot (/spot)  
- POST / 🔒 PROTEGE  
  *Champs obligatoires : `name`, `lon`, `lat`, `category`*  
  *Description* : Création d'un nouveau spot.  
  *Réponse* :  
  - Succès : `{ result: true, data: spot }`  
  - Erreurs : `406` (spot trop proche), `400` (échec d'insertion).  

- GET /loc/:lon/:lat/:limit 🔒 PROTEGE  
  *Description* : Récupère les spots proches d'une localisation.  
  *Réponse* :  
  - Succès : `{ result: true, data: [spots] }`  
  - Erreur : `400` (aucun résultat).  

- GET /:spotID 🔒 PROTEGE  
  *Description* : Récupération d'un spot par son ID.  
  *Réponse* : `{ result: Boolean(data), data: spot }`.  

- POST /picture/:spotID 🔒 PROTEGE 📤 FICHIER  
  *Description* : Ajoute une image à un spot.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreurs : `500` (échec Cloudinary), `400` (erreur de mise à jour).  

*/

const MINIMUM_SPOT_DISTANCE = 100; //500m
router.post(
  "/",
  checkBodyMW("name", "lon", "lat", "category"),
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
    const {
      userData: { _id: userID },
      name,
      lon,
      lat,
      category,
    } = req.body;

    //Verifie si un spot n'existe pas déjà à moins de MINIMUM_SPOT_DISTANCE
    const closestSpot = await Spot.aggregate(
      aggregateSpotByLocation(lon, lat, 1)
    );
    if (closestSpot[0]?.distance < MINIMUM_SPOT_DISTANCE) {
      res.status(406).json({
        result: false,
        reason: `Another spot exists at least than ${MINIMUM_SPOT_DISTANCE} m.`,
        fallback: closestSpot[0], //id du spot proche identifié
      });
      return;
    }

    const spot = new Spot({
      creationDate: new Date(),
      name,
      location: {
        type: "Point",
        coordinates: [lat, lon],
      },
      creator: userID,
      category,
      leaderboard: {
        alltime: [],
        week: [],
      },
      videos: [],
    });

    try {
      await spot.save();
      await Spot.populate(spot, populateSpot);
      res.json({
        result: true,
        data: spot,
      });
    } catch (error) {
      res.status(400).json({
        result: false,
        error,
      });
    }
  }
);

router.get("/loc/:lon/:lat/:limit", tokenVerifierMW, async (req, res) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lon = parseFloat(req.params.lon);
    const limit = parseInt(req.params.limit);
    const data = await Spot.aggregate(aggregateSpotByLocation(lon, lat, limit));
    if (!data) {
      res.status(400).json({
        result: false,
      });
      return;
    }

    res.json({
      result: true,
      data,
    });
  } catch (error) {
    res.json({
      result: false,
      error,
    });
  }
});

router.get("/:spotID", tokenVerifierMW, async (req, res) => {
  const { spotID } = req.params;
  try {
    const data = await Spot.findOne({ _id: spotID });
    await Spot.populate(data, populateSpot);
    res.json({
      result: Boolean(data),
      data,
    });
  } catch (error) {
    res.json({
      result: false,
      error,
    });
  }
});

router.post(
  "/picture/:spotID",
  fileUpload(),
  tokenVerifierMW,
  async (req, res) => {
    const { spotID } = req.params;
    const { photoFile } = req.files;

    const uploadResult = await uploadImage(photoFile);
    if (!uploadResult.result) {
      res.status(500).json(uploadResult);
      return;
    }

    const { url } = uploadResult;
    try {
      await Spot.updateOne(
        { _id: spotID },
        {
          $addToSet: { img: url },
        }
      );
      res.json({
        result: true,
      });
    } catch (error) {
      res.json({
        result: false,
        reason: "Error while adding spot picture",
        error,
      });
    }
  }
);

module.exports = router;
