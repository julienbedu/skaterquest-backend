const Crew = require("../models/crews");
/*
    Un middleware qui verifie si le membre est admin de son
    crew, 401 sinon.
    Doit etre appelé après tokenVerifierMW et getUserDataMW("crew", "uID")
*/

async function isUserCrewAdminMW(req, res, next) {
  const { userData } = req.body;
  //Est ce que l'utilisateur est admin ?;
  const isAdmin = await Crew.exists({
    _id: userData.crew,
    admins: userData.uID,
  });
  if (!isAdmin) {
    res.status(401).json({
      result: false,
      reason: "You're not admin.",
    });
    return;
  }
  next();
}

module.exports = isUserCrewAdminMW;
