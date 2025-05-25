// const app = require('./app');
// module.exports = app;

module.exports = (req, res) => {
  res.status(200).json({ success: true, message: "Backend Vercel minimal OK" });
};