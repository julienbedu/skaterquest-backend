const uid = require("uid2");
const jwt = require("jsonwebtoken");
//Secret pour la génération des tokens
const { SECRET_TOKEN_SALT } = process.env;

/*
 Génere un token d'authentification.
 Si aucun uID n'est donnée en génère un nouveau.
 Revoie l'uID et le token
*/

function generateToken(email, uID = uid(32)) {
  const token = jwt.sign({ email, uID }, SECRET_TOKEN_SALT, {
    expiresIn: "1 days",
  });
  return {
    uID,
    token,
  };
}

/*
Un middleware qui vérifie que la requète contient un token valide dans son header,
sinon répond par 401.

Les champs uID et email (extrait du token) sont rajoutés au body de la requète.
*/

function tokenVerifierMW(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    res.status(401).json({
      result: false,
      reason: "No auth token.",
    });
    return;
  }
  try {
    const { email, uID } = jwt.verify(token, SECRET_TOKEN_SALT);
    req.body.email = email;
    req.body.uID = uID;
    next();
  } catch (error) {
    res.status(401).json({
      result: false,
      reason: "Invalid auth token.",
      error,
    });
    return;
  }
}

module.exports = {
  tokenVerifierMW,
  generateToken,
};
