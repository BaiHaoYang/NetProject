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
var url = require('url');
var util = require('util');
connection.connect();
var tableName = 'tableOne'
var  sql = 'SELECT * FROM ' +tableName;
//查
function queryDb(res) {
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        console.log('------------------------------------------------------------\n\n');
        doSomething(res,result)
    });
    connection.end();
    // return "123"

}
router.get('/',function (req,res) {
    ress = res
    queryDb(ress);
});
function  doSomething(res,resuu) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(resuu));
}
module.exports = router;




