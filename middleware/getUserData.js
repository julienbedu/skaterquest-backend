const User = require("../models/users");

function getUserDataMW(...fields) {
  /*
        A middleware that populate the request body with the user
        objectID (useful for foreigh key) and other field.
        Must be call AFTER tokenVerifierMW
        */
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
