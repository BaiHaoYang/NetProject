var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456..',
    database : 'dbOne'
});
var ress ;
var express = require('express');
var router = express.Router();
var bodyParse = require('body-parser')
router.use(bodyParse.urlencoded({extended:false}))
var url = require('url');
var util = require('util');
connection.connect();
var tableName = 'thumTab'
var  sql = 'SELECT * FROM ' + tableName + " limit 0,50";
//查
function queryDb(res) {
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        doSomething(res,result)
    });
}
router.get('/',function (req,res) {
    ress = res
    queryDb(ress);
});
router.post('/',function (req,res) {
    var ss = req.body.startPage;
    var aa = ~~ss;
    var bb = aa * 20;
    sql = 'SELECT * FROM ' + tableName + " limit " + bb + ",20";
    ress = res;
    queryDb(ress);
});
router.post('/suiji',function (req,res) {
    var tempArr = "(";
    for(var i = 0 ; i < 20; i++ ){
        var id = Math.ceil(Math.random()*1000);
        if(i == 19){
            tempArr = tempArr +id+ ")";
        }else {
            tempArr = tempArr + id + ",";
        }
    }
    var ss = req.body.startPage;
    var aa = ~~ss;
    var bb = aa * 20;
    sql = 'SELECT * FROM ' + tableName + " WHERE id IN "+tempArr;
    ress = res;
    queryDb(ress);
});
function  doSomething(res,resuu) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(resuu));
}
module.exports = router;
function quSuijiSHU(qu,total) {

}
quSuijiSHU(20,10000);