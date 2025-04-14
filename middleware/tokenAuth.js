const uid = require("uid2");
const jwt = require("jsonwebtoken");

const { SECRET_TOKEN_SALT } = process.env;

function generateToken(email, uID = uid(32)) {
  /* 
  Function to generate a userToken, if no uID provided (sign in) create a new one?
  Return the uID and the genated token ( valid for 1 day )
    */
  const token = jwt.sign({ email, uID }, SECRET_TOKEN_SALT, {
    expiresIn: "1 days",
  });
  return {
    uID,
    token,
  };
}

function tokenVerifierMW(req, res, next) {
  /* 
  Middleware that check the request header for a valid authToken,
  If no/invalid token is provided, respond 401.
  */
 
  const  token  = req.header("Authorization");
  if (!token) {
    res.status(401).json({
      result: "false",
      reason: "No auth token",
    });
  }
  try {
    const { email, uID } = jwt.verify(token, SECRET_TOKEN_SALT);
    req.body.email = email;
    req.body.uID = uID;
    next();
  } catch (error) {
    res.status(401).json({
      result: "false",
      reason: "Invalid auth token",
      error,
    });
    return;
  }
}

module.exports = {
  tokenVerifierMW,
  generateToken,
};
