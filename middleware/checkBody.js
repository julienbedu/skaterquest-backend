/*
    Genère un middleware qui verifie que l'existence des champs passés en 
    paramètre, renvoie un 400 sinon.
    Les cas particulier :
        "" (chaine vide) : est invalide
        0 (le Number) est valide
*/
function checkBodyMW(...fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (
        (!req.body[field] || req.body[field] === "") &&
        !(req.body[field] === 0)
      ) {
        res.status(400).json({
          result: false,
          reason: `Missing field ${field} in request body`,
        });
        return;
      }
    }
    next();
  };
}

module.exports = checkBodyMW;
