const populateVideo = [
  { path: "spot" },
  { path: "tricks" },
  { path: "author", select: "-password -_id" },
  { path: "totalVote", select: "-password -_id" },
  { path: "weeklyVote", select: "-password -_id" },
];

const populateCrew = {
  path: "members.user",
  select: "-password -_id",
};

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

populateSpot = [
  { path: "creator", select: " -password -_id" },
  { path: "leaderboard.alltime", select: "-password -_id" },
  { path: "leaderboard.week", select: "-password -_id" },
  { path: "video", populate: populateVideo },
];

module.exports = {
  populateUser,
  populateCrew,
  populateVideo,
  populateSpot,
};
