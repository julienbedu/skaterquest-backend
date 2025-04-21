/*
Pipeline de population pour les clés étrangère.
Pour chaque document on fait attention à ne pas inclure de
données sensible (mots de passe hashé ou mongoID).
*/

const populateVideo = [
  { path: "spot" },
  { path: "author", select: "-password -_id" }, //User
  { path: "votes", select: "-password -_id" }, //User
];

populateSpot = [
  { path: "creator", select: "-password -_id" },
  { path: "leaderboard.alltime", select: "-password -_id" },
  { path: "leaderboard.week", select: "-password -_id" },
  {
    path: "videos",
    populate: populateVideo,
    options: { sort: { voteCount: -1 } },
  },
];

const populateCrew = [{ path: "members", select: "-password -_id" }]; //User

const populateUser = [
  { path: "friends", select: "-password -_id" },
  {
    path: "crew",
    populate: populateCrew,
  },
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
