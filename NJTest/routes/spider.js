var express = require('express');
var router = express.Router();
var http = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var superagent = require('superagent');
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456..',
    database : 'dbOne'
});
var titles=[];
var urls=[];
var times=[];
var Maxerror=0;
var totalPage=0;
var indexPage=2;
var nameIndex=0;
var searchName = "sex"//        rexliiiii sexlibris
var FPaUrl = "https://www.tangbure.org/get.html?id="+searchName;
var subPaUrl = "https://www.tangbure.org/get.html?currPage="+indexPage+"&id="+ searchName
var pagecount=0;
var totalDate=0;
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
    indexPage=2;
    totalDate=0;
    startPa(function (){
        // console.log('爬取结束拱爬取'+urls.length+'条数据');
        if(Maxerror == 2){
            console.log('zhenzhengjieshu爬取结束拱爬取'+urls.length+'条数据');
            // console.log(urls);
            res.end(JSON.stringify({"key":urls.length,"values":urls}));
        }
    });

});
function startPa(callback){
    nameIndex=0;
    console.log("正在进行第1页");
    //采用http模块向服务器发起一次get请求
    http.get(FPaUrl,function (res) {
        var html='';
        res.setEncoding('utf-8');
        res.on('data',function (chunk) {
            html+=chunk;
        });
        res.on('end',function () {
            var $= cheerio.load(html);
            var thumUrls=$('a[class=playBtn]');//这里解析出来的是链接的集合
            var totalNumber=$('body > div.layui-container > div > div:nth-child(1) > h1');//这是采集到多少个视频为文本 例如：采集到257个视频  最终要把257解析出来
            var totalPageStr= totalNumber[0].children[0].data;
            var res0 = totalPageStr.match(/采集到/); //使用g选项，全局匹配
            var res1 = totalPageStr.match(/个视频/); //使用g选项，全局匹配
            // console.log(res0.index); //输出[ 'aaa', 'aaa' ] 所有匹配的字符串组成的数组
            // console.log(res1.index); //输出[ 'aaa', 'aaa' ] 所有匹配的字符串组成的数
            totalDate = totalPageStr.substr(res0.index+3, res1.index-res0.index-3); // 获取子字符串。
            console.log('共'+totalDate+'条数据');
            // totalPage = Math.ceil(totalDate/thumUrls.length);
            // console.log('共分'+totalPage+'页');  // 返回 "Spain"。
            for(var i=0;i<thumUrls.length;i++) {
                var u = thumUrls[i].attribs['href'];
                urls.push(u);
            }
            if(totalDate == thumUrls.length){
                console.log("已采集完毕，共"+thumUrls.length+"条数据");
                return callback();
            }
                subPaUrl = "https://www.tangbure.org/get.html?currPage="+indexPage+"&id="+ searchName
                paDetail(subPaUrl,urls.length,function () {
                    return callback();
                });

        });
    });
};
function paDetail(sunUrl,currentIndex,callback) {
    console.log(sunUrl);
    http.get(sunUrl,function paend(res) {
        var html='';
        res.setEncoding('utf-8');
        res.on('data',function (chunk) {
            html+=chunk;
        });
        res.on('end',function () {
            var $= cheerio.load(html);
            var thumUrls=$('a[class=playBtn]');//这里解析出来的是链接的集合
            if(thumUrls.length == 0){
                Maxerror++;
                if(Maxerror > 1){
                    return callback();
                }
                if((thumUrls.length+currentIndex == totalDate )|| (thumUrls.length+currentIndex > totalDate)){
                    return callback();
                }
                indexPage++;
                subPaUrl = "https://www.tangbure.org/get.html?currPage="+indexPage+"&id="+ searchName
                paDetail(subPaUrl,urls.length,function () {
                    return callback();
                });
            }
            for(var i=0;i<thumUrls.length;i++) {
                var u = thumUrls[i].attribs['href'];
                urls.push(u);
            }
            if((thumUrls.length+currentIndex == totalDate )|| (thumUrls.length+currentIndex > totalDate)){
                return callback();
            }else{
                indexPage++;
                subPaUrl = "https://www.tangbure.org/get.html?currPage="+indexPage+"&id="+ searchName
                paDetail(subPaUrl,urls.length,function () {
                    return callback();
                });
            }

        });
    });
}
function saveDate(datasss){

    nameIndex = 0;
    connection.connect(function(err){
        if(err){
            console.log('connection connect err - :'+err);
            console.log('数据库链接失败');
        }
        console.log('数据库链接成功');
        for(var i = 0 ;i<datasss.length;i++){
            nameIndex++;
            console.log(datasss[i])
            var  userAddSql = 'INSERT INTO thumOneTab(urls,name) VALUES(?,?)';
            var  userAddSql_Params = [ datasss[i], searchName+nameIndex];
            inserData(userAddSql,userAddSql_Params);
        }
        console.log('本次共存储'+datasss.length+'条数据');
        // // 关闭 connection
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
            return;
        }
    });
}
module.exports = router;
startPa(function () {
    if (urls.length < totalDate) {
    }else{
        console.log('爬取结束拱爬取' + urls.length + '条数据');
        saveDate(urls);
        process.exit();
        return;
    }
    if(Maxerror > 2){
        Maxerror = -500;
        console.log('zhenzhengjieshu爬取结束拱爬取'+urls.length+'条数据');
        saveDate(urls);
        process.exit();
        return;

    }

});
