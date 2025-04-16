var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
require("../models/connection"); //utile ?

//Import locaux
const trimBodyFieldsMW = require("../middleware/trimFields");
const checkBodyMW = require("../middleware/checkBody");
const { generateToken, tokenVerifierMW } = require("../middleware/tokenAuth");
const { populateUser } = require("../models/pipelines/population");

const User = require("../models/users");
//Secret pour le hashage des mots de passe
const { SECRET_PASSWORD_SALT } = process.env;

/*
### Utilisateurs (`/user`) :

- POST `/signup`  
  Champs obligatoires : `email`, `username`, `password` (via `checkBodyMW`).  
  Description : Inscription d'un nouvel utilisateur.  
  Réponse :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `User already exists` (401), `Database insertion error` (400).

- POST `/signin`  
  Champs obligatoires : `email`, `password` (via `checkBodyMW`).  
  Description : Connexion d'un utilisateur existant.  
  Réponse :  
  - Succès : `{ result: true, token }`  
  - Erreurs : `No such user` (400), `Invalid password` (401).

- GET `/extend` 🔒 PROTEGE  
  Description : Renouvellement du token d'authentification.  
  Réponse : `{ result: true, token }`.

- GET `/` 🔒 PROTEGE  
  Description : Récupération des données de l'utilisateur connecté (sans mot de passe).  
  Réponse : `{ result: true, data: user }`.

- GET `/:uID` 🔒 PROTEGE  
  Description : Récupération des données d'un utilisateur spécifique par son `uID`.  
  Réponse : `{ result: true, data: user }`.

*/

// Route d'inscription
router.post(
  "/signup",
  checkBodyMW("email", "username", "password"),
  trimBodyFieldsMW("email", "username", "password"),
  async (req, res) => {
    const { email, password, username } = req.body;
    const userExists = await User.findOne({ email });

    // On vérifie que l'utilisateur n'est pas déjà inscrit
    if (userExists) {
      res.status(401).json({ result: false, reason: "User already exists" });
      return;
    }
    //Generation d'un token et d'un uID , hashage du mot de passe
    const { token, uID } = generateToken(email);
    const hash = bcrypt.hashSync(email + password + SECRET_PASSWORD_SALT, 10);

    const newUser = new User({
      username,
      uID,
      email,
      password: hash,
      inscriptionDate: new Date(),
    });
    try {
      const data = await newUser.save();
      res.json({ result: true, token: token });
    } catch (error) {
      // si erreur d'insertion (pas un email)
      res
        .status(400)
        .json({ result: false, reason: "Database insertion error", error });
    }
  }
);

// Route de connexion
router.post(
  "/signin",
  checkBodyMW("email", "password"),
  trimBodyFieldsMW("email", "password"),
  async (req, res) => {
    const { email, password } = req.body;
    //on cherche l'user par email
    const userExists = await User.findOne({ email });
    if (!userExists) {
      res.status(400).json({ result: false, reason: "No such user" });
      return;
    }
    //on verifie son mot de passe
    const validPasword = bcrypt.compareSync(
      email + password + SECRET_PASSWORD_SALT,
      userExists.password
    );
    if (!validPasword) {
      res.status(401).json({ result: false, reason: "Invalid password" });
      return;
    }
    //on lui renvoi son token
    const { token } = generateToken(email, userExists.uID);
    res.json({
      result: true,
      token,
    });
  }
);

//Pour demander un renouvellement du token
router.get("/extend", tokenVerifierMW, (req, res) => {
  const { email, uID } = req.body;
  const token = generateToken(email, uID);
  res.json({ result: true, token });
});

//Pour obtenir les informations de l'utilisateur connecté.
router.get("/", tokenVerifierMW, async (req, res) => {
  const { uID } = req.body;
  //attention à exclure les données sensibles
  const user = await User.findOne({ uID }, "-password  -_id");
  await User.populate(user, populateUser);
  res.json({
    result: true,
    data: user,
  });
});

//Pour demander les informations d'un utilisateur (par uID)
router.get("/:uID", tokenVerifierMW, async (req, res) => {
  const { uID } = req.params;
  const user = await User.findOne({ uID }, "-password  -_id");
  await User.populate(user, populateUser);
  res.json({
    result: true,
    data: user,
  });
});

module.exports = router;
