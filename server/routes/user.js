var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.status(200).json("Users's products are listing here");

});

module.exports = router;
