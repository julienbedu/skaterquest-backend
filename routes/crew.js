var express = require("express");
var router = express.Router();
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const { getUserDataMW } = require("../middleware/getUserData");
const checkBodyMW = require("../middleware/checkBody");
const Crew = require("../models/crews");
const User = require("../models/users");
const { populateCrew } = require("../models/pipelines/population");

/*
### Crews (`/crew`) :
- POST `/create` 🔒 PROTEGE  
  Champs obligatoires : `name` (via `checkBodyMW`).  
  Description : Création d'un nouveau crew.  
  Réponse :  
  - Succès : `{ result: true, data: newCrew }`  
  - Erreur : `Allready part of one crew` (400).

- GET `/:crewID` 🔒 PROTEGE  
  Description : Récupération des données d'un crew par son ID.  
  Réponse :  
  - Succès : `{ result: true, data: crew }`  
  - Erreur : `Crew not found` (404).

- PUT `/join/:crewID` 🔒 PROTEGE  
  Description : Rejoindre un crew existant.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `Allready part of one crew`, `Bad crew Id`, `Ooops wtf, bad userID` (400).

- PUT `/leave` 🔒 PROTEGE  
  Description : Quitter son crew actuel.  
  Réponse :  
  - Succès : `{ result: true }`  
  - Erreurs : `You're not part of any crew`, `Bad crew Id` (400).
*/

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
        data: newCrew,
      });
    } catch (error) {
      res.json({
        result: false,
        error,
      });
    }
  }
);

router.get("/:crewID", tokenVerifierMW, async (req, res) => {
  const { crewID } = req.params;
  const data = await Crew.findOne({ _id: crewID });
  if (!data) {
    res.status(404).json({
      result: false,
      reason: "Crew not found.",
    });
    return;
  }
  await Crew.populate(data, populateCrew);
  res.json({
    result: true,
    data,
  });
});

router.put(
  "/join/:crewID",
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
    const { crewID } = req.params;
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
      return;
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
