var express = require('express');
var router = express.Router();
var url = require('url');
var util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  //   res.sendfile('./views/index.html');
    var params = url.parse(req.url, true).query;
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({"name":params.name,"url":params.url,"jik":["asd","dadas","dasd"]}));
});
router.get('/123', function(req, res, next) {
    // res.render('index', { title: 'Express' });
      res.sendfile('./views/index.html');
    // res.writeHead(200, {'Content-Type': 'application/json'});
    // res.end(JSON.stringify({"key":"233","jik":["asd","dadas","dasd"]}));
});
module.exports = router;
