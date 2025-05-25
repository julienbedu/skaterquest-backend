// const app = require('./app');
// module.exports = app;

module.exports = (req, res) => {
  res.status(200).json({ message: 'Fonction serverless basique OK' });
};