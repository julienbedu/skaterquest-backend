var express = require("express");
const Trick = require("../models/tricks");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const { getMongoIdMW } = require("../middleware/getMongoId");
const User = require("../models/users");
var router = express.Router();

router.get("/", async (_, res) => {
  const data = await Trick.find({});
  res.json({
    result: true,
    data,
  });
});

router.put("/validate/:id", tokenVerifierMW, getMongoIdMW, async (req, res) => {
  const userID = req.body.userMongoID;
  const tricksID = req.params.id;

  const tricksExists = await Trick.exists({ _id: tricksID });
  if (!tricksExists) {
    res.json({
      result: false,
      reason: "No such trick",
    });
  }

  await User.updateOne(
    { _id: userID },
    { $addToSet: { validatedTricks: tricksID } }
  );
  res.json({
    result: true,
  });
});

router.put(
  "/devalidate/:id",
  tokenVerifierMW,
  getMongoIdMW,
  async (req, res) => {
    const userID = req.body.userMongoID;
    const tricksID = req.params.id;

    const tricksExists = await Trick.exists({ _id: tricksID });
    if (!tricksExists) {
      res.json({
        result: false,
        reason: "No such trick",
      });
    }

    await User.updateOne({ _id: userID }, { $pull: { validatedTricks: _id } });
    res.json({
      result: true,
    });
  }
);

module.exports = router;
