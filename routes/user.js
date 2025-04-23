const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const bcrypt = require("bcrypt");

//Import locaux
const trimBodyFieldsMW = require("../middleware/trimFields");
const checkBodyMW = require("../middleware/checkBody");
const { generateToken, tokenVerifierMW } = require("../middleware/tokenAuth");
const { populateUser } = require("../models/pipelines/population");

const User = require("../models/users");
const { uploadImage } = require("../lib/cloudinaryUpload");
//Secret pour le hashage des mots de passe
const { SECRET_PASSWORD_SALT } = process.env;

/*
### User (/user)

- POST /signup  
  *Champs obligatoires : `email`, `username`, `password`*  
  *Description* : Inscription d'un nouvel utilisateur.  
  *Réponse* :  
  - Succès : `{ result: true, data: { token, uID, username, email } }`  
  - Erreurs : `401` (utilisateur existant), `400` (erreur base de données).  

- POST /signin  
  *Champs obligatoires : `email`, `password`*  
  *Description* : Connexion d'un utilisateur.  
  *Réponse* :  
  - Succès : `{ result: true, data: { token, uID, username, email } }`  
  - Erreurs : `400` (utilisateur inexistant), `401` (mot de passe invalide).  

- GET /extend 🔒 PROTEGE  
  *Description* : Renouvellement du token.  
  *Réponse* : `{ result: true, data: { token } }`.  

- GET / 🔒 PROTEGE  
  *Description* : Récupération des données de l'utilisateur connecté.  
  *Réponse* : `{ result: true, data: user }`.  

- GET /:uID 🔒 PROTEGE  
  *Description* : Récupération des données d'un utilisateur par son uID.  
  *Réponse* : `{ result: true, data: user }`.  

- POST /avatar 🔒 PROTEGE 📤 FICHIER  
  *Description* : Mise à jour de l'avatar utilisateur.  
  *Réponse* :  
  - Succès : `{ result: true }`  
  - Erreur : `500` (échec Cloudinary), `400` (erreur de mise à jour).  

- DELETE /delete 🔒 PROTEGE  
  *Description* : Suppression du compte utilisateur connecté.  
  *Réponse* :  
  - Succès : `{ result: true, message: "Compte supprimé avec succès" }`  
  - Erreur : `404` (utilisateur introuvable), `500` (erreur serveur).  
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
      await newUser.save();
      res.json({
        result: true,
        data: {
          token,
          email,
          uID,
          username,
        },
      });
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
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ result: false, reason: "No such user" });
      return;
    }
    //on verifie son mot de passe
    const validPasword = bcrypt.compareSync(
      email + password + SECRET_PASSWORD_SALT,
      user.password
    );
    if (!validPasword) {
      res.status(401).json({ result: false, reason: "Invalid password" });
      return;
    }
    //on lui renvoi son token
    const { token } = generateToken(email, user.uID);
    res.json({
      result: true,
      data: {
        token,
        email,
        uID: user.uID,
        username: user.username,
      },
    });
  }
);

//Pour demander un renouvellement du token
router.get("/extend", tokenVerifierMW, (req, res) => {
  const { email, uID } = req.body;
  const token = generateToken(email, uID);
  res.json({ result: true, data: token });
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

router.post("/avatar", fileUpload(), tokenVerifierMW, async (req, res) => {
  const { uID } = req.body;
  const { photoFile } = req.files;

  const uploadResult = await uploadImage(photoFile);
  if (!uploadResult.result) {
    res.status(500).json(uploadResult);
    return;
  }
  const { url } = uploadResult;
  try {
    await User.updateOne({ uID }, { avatar: url });
    res.json({
      result: true,
    });
  } catch (error) {
    res.json({
      result: false,
      reason: "Error while adding user avatar",
      error,
    });
  }
});

router.get("/search/:searchTerm", tokenVerifierMW, async (req, res) => {
  const { searchTerm } = req.params;
  const data = await User.find(
    {
      username: { $regex: new RegExp(searchTerm, "gi") },
    },
    "-password -_id"
  );
  res.json({
    result: true,
    data,
  });
});

//Suppression du compte utilisateur
router.delete("/delete/:uID", tokenVerifierMW, async (req, res) => {
  const { uID } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ uID });
    if (!deletedUser) {
      return res.status(404).json({ result: false, reason: "User not found" });
    }
    res.json({ result: true, message: "Compte supprimé avec succès" });
  } catch (error) {
    res.status(500).json({
      result: false,
      reason: "Erreur serveur lors de la suppression",
      error,
    });
  }
});

module.exports = router;
