function trimBodyFieldsMW(...fields) {
  /* 
    Middleware that remove spaces at the begining and the end of
    the specified field (if they are string)
    */
  return function (req, _, next) {
    for (let field of fields) {
      typeof req.body[field] == "string" &&
        (req.body[field] = req.body[field].trim());
    }
    next();
  };
}

module.exports = trimBodyFieldsMW;
