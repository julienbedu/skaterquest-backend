var express = require("express");
var router = express.Router();
const { tokenVerifierMW } = require("../middleware/tokenAuth");
const { getUserDataMW } = require("../middleware/getUserData");
const checkBodyMW = require("../middleware/checkBody");
const Crew = require("../models/crews");
const User = require("../models/users");
const { populateCrew } = require("../models/pipelines/population");
const isUserCrewAdminMW = require("../middleware/isUserCrewAdmin");

/*
Crews (/crew)
    GET /:crewID 🔒 PROTEGE
    Description : Récupération des données d'un crew par son ID.
    Réponse :
        Succès : { result: true, data: crew }
        Erreur : Crew not found (404).

    POST /create 🔒 PROTEGE
    Champs obligatoires : name.
    Description : Création d'un nouveau crew.
    Réponse :
        Succès : { result: true, data: newCrew }
        Erreur : Already part of one crew (400).

    PUT /promote/:targetUserID 🔒 PROTEGE 🛡️ ADMIN
    Description : Promouvoir un membre en administrateur du crew.
    Réponse :
        Succès : { result: true }
        Erreur : Error while promoting user (400).

    PUT /demote/:targetUserID 🔒 PROTEGE 🛡️ ADMIN
    Description : Rétrograder un administrateur du crew.
    Réponse :
        Succès : { result: true }
        Erreur : Error while demoting user (400).

    PUT /add/:targetUserID 🔒 PROTEGE 🛡️ ADMIN
    Description : Ajouter un utilisateur au crew.
    Réponse :
        Succès : { result: true }
        Erreur : User is already part of a crew (400).

    PUT /remove/:targetUserID 🔒 PROTEGE 🛡️ ADMIN
    Description : Retirer un utilisateur du crew.
    Réponse :
        Succès : { result: true }
        Erreur : Error while removing user (400).

    PUT /leave 🔒 PROTEGE
    Description : Quitter son crew actuel.
    Réponse :
        Succès : { result: true }
        Erreurs : You're not part of any crew, Bad crew Id (400).

*/

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

router.post(
  "/",
  checkBodyMW("name"),
  tokenVerifierMW,
  getUserDataMW("crew", "uID"),
  async (req, res) => {
    const { name, userData } = req.body;
    if (userData.crew) {
      res.json({
        result: false,
        reason: "Allready part of one crew.",
      });
      return;
    }
    console.log(userData);
    const newCrew = new Crew({
      name,
      creationDate: Date.now(),
      members: [userData._id],
      admins: [userData.uID],
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

router.put(
  "/promote/:targetUserID",
  tokenVerifierMW,
  getUserDataMW("crew", "uID"),
  isUserCrewAdminMW,
  async (req, res) => {
    const { userData } = req.body;
    const { targetUserID } = req.params;
    const { _id: targetMongoID } = await User.findOne({ uID: targetUserID });

    const { matchedCount } = await Crew.updateOne(
      { _id: userData.crew },
      {
        $addToSet: {
          members: targetMongoID,
          admins: targetUserID,
        },
      }
    );
    if (matchedCount) {
      res.json({
        result: true,
      });
      return;
    }
    res.status(400).json({
      result: false,
      reason: "Error while promoting user to admin",
    });
  }
);

router.put(
  "/demote/:targetUserID",
  tokenVerifierMW,
  getUserDataMW("crew", "uID"),
  isUserCrewAdminMW,
  async (req, res) => {
    const { userData } = req.body;
    const { targetUserID } = req.params;
    const { _id: targetMongoID } = await User.findOne({ uID: targetUserID });
    const { matchedCount } = await Crew.updateOne(
      { _id: userData.crew },
      {
        $pull: {
          admins: targetMongoID,
          members: targetUserID,
        },
      }
    );
    if (matchedCount) {
      res.json({
        result: true,
      });
      return;
    }
    res.status(400).json({
      result: false,
      reason: "Error while demoting user from admin",
    });
  }
);

router.put(
  "/add/:targetUserID",
  tokenVerifierMW,
  getUserDataMW("crew", "uID"),
  isUserCrewAdminMW,
  async (req, res) => {
    const { userData } = req.body;
    const { targetUserID } = req.params;
    const { _id: targetMongoID } = await User.findOne({ uID: targetUserID });

    //Vérifie que l'utilisateur cible ne fait pas déja parti d'un crew
    const { crew } = await User.find({ uID: targetUserID });
    if (crew) {
      res.status(400).json({
        result: false,
        reason: "User is allready part of a crew.",
      });
      return;
    }
    const { matchedCount } = await Crew.updateOne(
      { _id: userData.crew },
      { $addToSet: { members: targetMongoID } }
    );
    if (matchedCount) {
      //Ajoute le crew au profil de l'utilisateur cible
      await User.updateOne(
        { _id: targetMongoID },
        { $set: { crew: userData.crew } }
      );
      res.json({
        result: true,
      });
      return;
    }
    res.status(400).json({
      result: false,
      reason: "Error while adding user to crew",
    });
  }
);

router.put(
  "/remove/:targetUserID",
  tokenVerifierMW,
  getUserDataMW("crew", "uID"),
  isUserCrewAdminMW,
  async (req, res) => {
    const { userData } = req.body;
    const { targetUserID } = req.params;
    const { _id: targetMongoID } = await User.findOne({ uID: targetUserID });
    const { matchedCount } = await Crew.updateOne(
      { _id: userData.crew },
      { $pull: { members: targetMongoID, admins: targetUserID } }
    );

    if (matchedCount) {
      //Retire le crew de l'utilisateur cible
      await User.updateOne({ _id: targetMongoID }, { $unset: { crew: "" } });
      res.json({
        result: true,
      });
      return;
    }
    res.status(400).json({
      result: false,
      reason: "Error while removing user from crew",
    });
  }
);

router.put(
  "/leave",
  tokenVerifierMW,
  getUserDataMW("crew", "uID"),
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
