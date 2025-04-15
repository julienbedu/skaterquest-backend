var express = require("express");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const checkBodyMW = require("../middleware/checkBody");
const Spot = require("../models/spots");
const { populateSpot } = require("../models/pipelines/population");
const { getUserDataMW } = require("../middleware/getUserData");
const { aggregateSpotByLoc } = require("../models/pipelines/aggregation");
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
  const data = await Spot.aggregate(aggregateSpotByLoc(lon, lat , limit));

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
