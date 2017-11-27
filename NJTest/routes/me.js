var express = require('express');
var router = express.Router();
var bodyParse = require('body-parser')
router.use(bodyParse.urlencoded({extended:false}))
router.use(express.static('./me.html'))
var postHTML =
    '<html><head><meta charset="utf-8"><title>菜鸟教程 Node.js 实例</title></head>' +
    '<body>' +
    '<form method="post">' +
    '网站名： <input name="name"><br>' +
    '网站 URL： <input name="url"><br>' +
    '<input type="submit">' +
    '</form>' +
    '</body></html>';
router.post('/',function (req,res) {
    console.log(req.body.fname)
    console.log(req.body.lname)
    res.send(postHTML)
})
module.exports = router;