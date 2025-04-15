/*
Retourne un middleware qui enlève les espaces en bout de tout les champs données
en paramètres. 
*/
function trimBodyFieldsMW(...fields) {
  return function (req, _, next) {
    for (let field of fields) {
      typeof req.body[field] == "string" &&
        (req.body[field] = req.body[field].trim());
    }
    next();
  };
}

module.exports = trimBodyFieldsMW;
