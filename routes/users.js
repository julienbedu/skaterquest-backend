var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//Custom Middleware
const trimBodyFieldsMW = require("../middleware/trimFields");
const checkBodyMW = require("../middleware/checkBody");
const { generateToken, tokenVerifierMW } = require("../middleware/tokenAuth");

// Route d'inscription
router.post(
  "/signup",
  checkBodyMW("email", "username", "password"),
  trimBodyFieldsMW("email", "username", "password"),
  async (req, res) => {
    const { email, password, username } = req.body;
    // On vérifie que l'utilisateur n'est pas déjà inscrit
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(userExists);
      res.status(401).json({ result: false, error: "User already exists" });
      return;
    }
    const { token, uID } = generateToken(email);
    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username,
      uID,
      email,
      password: hash,
      inscriptionDate: new Date(),
    });
    try {
      const result = await newUser.save();
      res.json({ result: true, token: token, data: result });
    } catch (error) {
      res.json({ result: false, reason: "Invalid email", error });
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

    const userExists = await User.findOne({ email });
    if (!userExists) {
      res.status(400).json({ result: false, reason: "No such user" });
      return;
    }

    const validPasword = bcrypt.compareSync(password, userExists.password);
    if (!validPasword) {
      res.status(401).json({ result: false, reason: "Invalid password" });
      return;
    }

    res.json({
      result: true,
      token: generateToken(email, userExists.uID),
    });
  }
);

router.get("/extend", tokenVerifierMW, (req, res) => {
  const { email, uID } = req.body;
  const token = generateToken(email, uID);
  res.json({ result: true, token });
});

module.exports = router;
