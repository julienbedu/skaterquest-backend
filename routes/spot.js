var express = require("express");
var router = express.Router();
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const checkBodyMW = require("../middleware/checkBody");
const Spot = require("../models/spots");
const { populateSpot } = require("../models/pipelines/population");
const { getUserDataMW } = require("../middleware/getUserData");
const { aggregateSpotByLocation } = require("../models/pipelines/aggregation");

/*Spots (/spot)

    POST / 🔒 PROTEGE
    Champs obligatoires : name, lon, lat, category.
    Description : Création d'un nouveau spot.
    Réponse :
        Succès : { result: true, data: { _id: spotID } }
        Erreurs : 400 (échec d'insertion), 406 (spot trop proche).

    GET /:id 🔒 PROTEGE
    Description : Récupération des données d'un spot par son ID.
    Réponse : { result: Boolean(data), data: spot }.

    GET /loc/:lon/:lat/:limit 🔒 PROTEGE
    Description : Récupère les spots les plus proches d'une localisation.
    Réponse :
        Succès : { result: true, data: [spots] }
        Aucun résultat/Erreur : { result: false } (400).

*/

const MINIMUM_SPOT_DISTANCE = 500; //500m
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
        fallback: closestSpot[0]._id, //id du spot proche identifié
      });
      return;
    }

    const spot = new Spot({
      creationDate: new Date(),
      name,
      location: {
        type: "Point",
        coordinates: [lon, lat],
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
      res.json({
        result: true,
        data: { _id: spot._id },
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
});

router.get("/:spotID", tokenVerifierMW, async (req, res) => {
  const { spotID } = req.params;
  const data = await Spot.findOne({ _id: spotID });
  await Spot.populate(data, populateSpot);
  res.json({
    result: Boolean(data),
    data,
  });
});

module.exports = router;
