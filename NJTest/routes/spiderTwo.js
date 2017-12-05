var rf=require("fs");
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'qdm114549520.my3w.com',
    user     : 'qdm114549520',
    password : 'yasoapi1992',
    database : 'qdm114549520_db',
    insecureAuth: true
});
var searchName = "bilibili920 "
rf.readFile("test.txt",'utf-8',function(err,data){
    if(err){
        console.log("error");
    }else{
        var aa = data;
        var bb = aa.split("\n");
        saveDate(bb);
    }
});
function saveDate(datasss){

    nameIndex = 0;
    connection.connect(function(err){
        if(err){
            console.log('connection connect err - :'+err);
            console.log('数据库链接失败');
        }
        console.log('数据库链接成功');
        for(var i = 0 ;i<datasss.length-1;i++){
            nameIndex++;
            console.log(datasss[i])
            var  userAddSql = 'INSERT INTO thumTab(urls,name) VALUES(?,?)';
            var  userAddSql_Params = [datasss[i], searchName+nameIndex];
            inserData(userAddSql,userAddSql_Params);
        }

        console.log('插入完毕');
        connection.end(function(err){
            if(err){
                console.log('connection end err - :'+err);
                return;
            }
            console.log('数据库链接关闭');
        });
    });

}
function inserData(userAddSql,userAddSql_Params) {
    connection.query(userAddSql,userAddSql_Params,function (err, result) {
        if(err){
            console.log('INSERT ERROR - ',err.message);
        }
    });
}