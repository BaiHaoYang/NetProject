var express = require('express');
var router = express.Router();
var bodyParse = require('body-parser')
var url = require('url');
var util = require('util');
router.use(bodyParse.urlencoded({extended:false}))
router.use(express.static('./me.html'))
router.post('/',function (req,res) {
    console.log(req.body.fname)  //这是post的获取方式
    console.log(req.body.lname)
    res.sendfile('./views/me.html');
});
router.get('/',function (req,res) {
    //这是get的获取方式  在用下面语句获取参数的时候 比如导入  var url = require('url');  var util = require('util');  这两个模块
    var params = url.parse(req.url, true).query;
    console.log(params.aa)
    res.end();
});
module.exports = router;