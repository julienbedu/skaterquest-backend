const mongoose = require('mongoose');

const connectionString = process.env.CONNECTION_STRING;

mongoose.set('strictQuery', true); // Supprime le message d'avertissement de Mongoose (qui pollue visuellement la console)

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
    .then(() => console.log('Database connected \\(°▼°)/'))
    .catch(error => console.error(error));