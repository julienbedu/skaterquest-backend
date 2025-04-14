const { uid } = require("uid2");
const jwt = require("jsonwebtoken");

const { SECRET_TOKEN_SALT } = process.env;

export function generateToken(username, uID = uid(32)) {
  const token = jwt.sign({ username, uID }, SECRET_TOKEN_SALT, {
    expiresIn: "1 days",
  });
  return {
    uID,
    token,
  };
}

export function tokenVerifierMW(req, res, next) {
  const { token } = req.headers.get("Authorization");
  if (!token) {
    res.status(401).json({
      result: "false",
      reason: "No auth token",
    });
  }
  try {
    const { username, uID } = jwt.verify(token, SECRET_TOKEN_SALT);
    req.username = username;
    req.uID = uID;
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
