/*
Pipeline de population pour les clés étrangère.
Pour chaque document on fait attention à ne pas inclure de
données sensible (mots de passe hashé ou mongoID).
*/

const populateVideo = [
  { path: "spot" },
  { path: "tricks" },
  { path: "author", select: "-password -_id" }, //User
  { path: "totalVote", select: "-password -_id" }, //User
  { path: "weeklyVote", select: "-password -_id" }, //User
];

populateSpot = [
  { path: "creator", select: "-password -_id" },
  { path: "leaderboard.alltime", select: "-password -_id" },
  { path: "leaderboard.week", select: "-password -_id" },
  { path: "video", populate: populateVideo },
];

const populateCrew = [{ path: "members", select: "-password -_id" }]; //User

const populateUser = [
  { path: "friends", select: "-password -_id" },
  {
    path: "crew",
    populate: populateCrew,
  },
  { path: "validatedTricks" },
  {
    path: "videos",
    populate: populateVideo,
  },
];

module.exports = {
  populateUser,
  populateCrew,
  populateVideo,
  populateSpot,
};
