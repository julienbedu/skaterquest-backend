const app = require("./app");

// Simuler "listen()"" dans un environnement serverless (pour Vercel)
module.exports = (req, res) => {
  app(req, res);
};