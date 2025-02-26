var express = require("express");
var router = express.Router();
const { homeController } = require("../controllers/homeController");

/* GET home page. */
router.get("/", homeController);

module.exports = router;
