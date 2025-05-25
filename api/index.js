// const app = require('./app');
// module.exports = app;

// module.exports = (req, res) => {
//   res.status(200).json({ message: 'Fonction serverless basique OK' });
// };

const app = require('./app');
const http = require('http');

const server = http.createServer(app);

server.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port', process.env.PORT || 3000);
});