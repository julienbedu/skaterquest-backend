const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    token: String,
    username: String,
    email: String,
    password: String,
    inscriptionDate: Date,
    personalScore: Number,
    avatar: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    crew: { type: mongoose.Schema.Types.ObjectId, ref: 'crews' },
    validatedTricks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tricks' }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'videos' }],
});

const User = mongoose.model('users', userSchema);

module.exports = User;