var express = require("express");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const checkBodyMW = require("../middleware/checkBody");
const Spot = require("../models/spots");
const { populateSpot } = require("../models/pipelines/population");
const { getUserDataMW } = require("../middleware/getUserData");
var router = express.Router();

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

    const spot = new Spot({
      creationDate: new Date(),
      name,
      localisation: {
        lat,
        lon,
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
      });
    } catch (error) {
      res.status(400).json({
        result: false,
        error,
      });
    }
  }
);

router.get("/:id", tokenVerifierMW, async (req, res) => {
  const _id = req.params.id;
  const data = await Spot.findOne({ _id });
  await Spot.populate(data, populateSpot);
  res.json({
    result: Boolean(data),
    data,
  });
});

module.exports = router;
