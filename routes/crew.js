var express = require("express");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const { getUserDataMW } = require("../middleware/getUserData");
const checkBodyMW = require("../middleware/checkBody");
const Crew = require("../models/crews");
const User = require("../models/users");
var router = express.Router();

router.post(
  "/create",
  checkBodyMW("name"),
  tokenVerifierMW,
  getUserDataMW("crew"),
  async (req, res) => {
    const { name, userData } = req.body;
    if (userData.crew) {
      res.json({
        result: false,
        reason: "Allready part of one crew.",
      });
      return;
    }
    const newCrew = new Crew({
      name,
      creationDate: Date.now(),
      members: [userData._id],
    });
    try {
      const { _id } = await newCrew.save();
      await User.updateOne({ _id: userData._id }, { crew: _id });
      res.json({
        result: true,
      });
    } catch (error) {
      res.json({
        result: false,
        error,
      });
    }
  }
);

router.put(
  "/join/:id",
  tokenVerifierMW,
  getUserDataMW("crew"),
  async (req, res) => {
    const { _id, crew } = req.body.userData;
    if (crew) {
      res.json({
        result: false,
        reason: "Allready part of one crew.",
      });
      return;
    }
    const crewID = req.params.id;
    const { matchedCount: crewUpdate } = await Crew.updateOne(
      { _id: crewID },
      {
        $addToSet: { members: _id },
      }
    );
    if (!crewUpdate) {
      res.json({ result: false, reason: "Bad crew Id" });
      return;
    }
    const { matchedCount: userUpdate } = await User.updateOne(
      { _id },
      { $set: { crew: crewID } }
    );
    if (!userUpdate) {
      res.json({ result: false, reason: "Ooops wtf, bad userID." });
      return;
    }
    res.json({ result: true });
  }
);

router.put(
  "/leave",
  tokenVerifierMW,
  getUserDataMW("crew"),
  async (req, res) => {
    const { _id, crew } = req.body.userData;
    if (!crew) {
      res.json({
        result: false,
        reason: "You're not part of any crew.",
      });
    }
    const { matchedCount } = await Crew.updateOne(
      { _id: crew },
      {
        $pull: {
          members: _id,
        },
      }
    );
    if (matchedCount) {
      await User.updateOne({ _id }, { $unset: { crew: "" } });
      res.json({ result: true });
      return;
    }
    res.json({ result: false, reason: "Bad crew Id" });
  }
);

module.exports = router;
