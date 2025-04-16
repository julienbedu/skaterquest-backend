const User = require("../models/users");

/*
Gènère un middleware qui va peupler le body de la requète avec les
informations utilisateurs données en paramètre.
Toutes les infos sont stockées dans req.body.userData.

_id (le mongoID) est inclu par default

Doit etre appelé APRES le middleware d'authentification.
*/
function getUserDataMW(...fields) {
  return async function (req, res, next) {
    const { uID } = req.body;
    if (!uID) {
      res.status(401).json({
        result: false,
        reason: "User uID not found.",
      });
      return;
    }
    const user = await User.findOne(
      { uID: req.body.uID },
      "_id " + fields.join(" ")
    );
    if (!user) {
      res.status(400).json({
        result: false,
        reason: "User not found.",
      });
      return;
    }
    req.body.userData = user;
    next();
  };
}



module.exports = { getUserDataMW };
