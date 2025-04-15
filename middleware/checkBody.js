function checkBodyMW(...fields) {
  /*
    Middleware that check for the presence of the supplied field,
    and send back 400 if abscent.
    Will also reject empty string
    */
  return (req, res, next) => {
    for (const field of fields) {
      if (!req.body[field] || req.body[field] === "") {
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
