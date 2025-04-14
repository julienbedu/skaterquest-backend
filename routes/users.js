var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// Route d'inscription
router.post("/signup", (req, res) => {
  // On vérifie à l'aide du module checkBody que les champs de saisie sont remplis
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // On vérifie que l'utilisateur n'est pas déjà écrit
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      // Cryptage du mot de passe
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Ajout de l'utilisateur en BDD
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        inscriptionDate: new Date(),
      });
      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Echec de l'inscription si l'utilisateur est déjà enregistré
      res.json({ result: false, error: "User already exists" });
    }
  });
});

// Route de connexion
router.post("/signin", (req, res) => {
  // On vérifie à l'aide du module checkBody que les champs de saisie sont remplis
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    // Si l'utilisateur est trouvé, on compare son mot de passe avec sa version cryptée et selon le résultat on retourne les données de l'utilisateur ou une erreur
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

module.exports = router;