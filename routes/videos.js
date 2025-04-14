var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  console.log(res, req);
});

router.post("/", (req, res) => {
  console.log(res, req);
});

module.exports = router;
