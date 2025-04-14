function trimBodyFields(...fields) {
    return function (req, _, next) {
      for (let field of fields) {
        req.body[field] && (req.body[field] = req.body[field].trim()) 
      }
      next();
    };
  }
  
  module.exports = trimBodyFields;