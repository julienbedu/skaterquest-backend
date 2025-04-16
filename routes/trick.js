var express = require("express");
const Trick = require("../models/tricks");
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const User = require("../models/users");
const { getUserDataMW } = require("../middleware/getUserData");
var router = express.Router();

/*
Figures (/trick)

    GET /
    Description : Liste de toutes les figures disponibles.
    Réponse : { result: true, data: [tricks] }.

    PUT /validate/:trickID 🔒 PROTEGE
    Description : Valider une figure pour l'utilisateur connecté.
    Réponse :
        Succès : { result: true }
        Erreur : No such trick (400).

    PUT /invalidate/:trickID 🔒 PROTEGE
    Description : Retirer une validation de figure pour l'utilisateur connecté.
    Réponse :
        Succès : { result: true }
        Erreur : No such trick (400).

*/

router.get("/", async (_, res) => {
  const data = await Trick.find({});
  res.json({
    result: true,
    data,
  });
});

router.put(
  "/validate/:trickID",
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
    const { _id: userID } = req.body.userData;
    const { trickID } = req.params;

    const tricksExists = await Trick.exists({ _id: trickID });
    if (!tricksExists) {
      res.json({
        result: false,
        reason: "No such trick",
      });
    }

    await User.updateOne(
      { _id: userID },
      { $addToSet: { validatedTricks: trickID } }
    );
    res.json({
      result: true,
    });
  }
);

router.put(
  "/invalidate/:trickID",
  tokenVerifierMW,
  getUserDataMW(),
  async (req, res) => {
    const { _id: userID } = req.body.userData;
    const { trickID } = req.params;

    const tricksExists = await Trick.exists({ _id: trickID });
    if (!tricksExists) {
      res.json({
        result: false,
        reason: "No such trick",
      });
    }

    await User.updateOne(
      { _id: userID },
      { $pull: { validatedTricks: trickID } }
    );
    res.json({
      result: true,
    });
  }
);

module.exports = router;
