const User = require("../models/users");

async function getMongoIdMW(req, res, next) {
  /*
    A middleware that populate the request body with the user
    objectID (useful for foreigh key).
    Must be call AFTER tokenVerifierMW
    */
  const { uID } = req.body;
  if (!uID) {
    res.status(401).json({
      result: false,
      reason: "User uID not found.",
    });
    return;
  }
  console.log(req.body.uID)
  const user = await User.findOne({ uID: req.body.uID }, "_id");
  if (!user) {
    res.status(400).json({
      result: false,
      reason: "User not found.",
    });
    return;
  }
  req.body.userMongoID = user._id;
  next();
}

module.exports = { getMongoIdMW };
