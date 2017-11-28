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
var maxPage=10;
var totalPage=0;
var indexPage=1;
var nameIndex=0;
var searchName = "sex"
var FPaUrl = "https://www.tangbure.org/get.html?id="+searchName;
var subPaUrl = "https://www.tangbure.org/get.html?currPage="+indexPage+"&id="+ searchName
var pagecount=0;
var totalDate=0;
function startPa(){
    nameIndex=0;
    connection.connect(function(err){
        if(err){
            console.log('connection connect err - :'+err);
            return;
        }
        console.log('数据库链接成功');
    });
    console.log("正在进行第1页");
    //采用http模块向服务器发起一次get请求
    http.get(FPaUrl,function (res) {
        var html='';
        res.setEncoding('utf-8');
        res.on('data',function (chunk) {
            html+=chunk;
        });
        // body > div.layui-container > div > div:nth-child(3) > div.table-responsive > table > tbody > tr:nth-child(1) > td:nth-child(2) > a
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
            totalPage = Math.ceil(totalDate/thumUrls.length);
            console.log('共分'+totalPage+'页');  // 返回 "Spain"。
            for(var i=0;i<thumUrls.length;i++) {
                var u = thumUrls[i].attribs['href'];
                urls.push(u);
            }
            saveDate(urls,0);
            pagecount = thumUrls.length;
            urls = [];
            indexPage++;
            if(pagecount == totalDate || pagecount > totalDate){
                console.log('爬取结束');
                console.log(d12de);
            }
            for(var i=indexPage;i<totalPage+1;i++) {

                subPaUrl = "https://www.tangbure.org/get.html?currPage="+indexPage+"&id="+ searchName
                paDetail(subPaUrl,i);
                indexPage++;
            }
        });
    });
};
function paDetail(sunUrl,indexPageDetail) {
    console.log('当前正在爬取'+searchName+'的第'+indexPageDetail+"页");
    console.log(sunUrl);
    http.get(sunUrl,function (res) {
        var html='';
        res.setEncoding('utf-8');
        res.on('data',function (chunk) {
            html+=chunk;
        });
        res.on('end',function () {
            var $= cheerio.load(html);
            var thumUrls=$('a[class=playBtn]');//这里解析出来的是链接的集合
            for(var i=0;i<thumUrls.length;i++) {
                var u = thumUrls[i].attribs['href'];
                urls.push(u);
            }
            saveDate(urls,indexPageDetail);
            pagecount=pagecount+thumUrls.length;
            if(pagecount == totalDate || pagecount > totalDate){
                console.log(d12de);
            }
            urls = [];
        });
    });
}
function saveDate(datasss,paindex){
    for(var i = 0 ;i<datasss.length;i++){
        nameIndex++;
        var  userAddSql = 'INSERT INTO thumTab(urls,name) VALUES(?,?)';
        var  userAddSql_Params = [ datasss[i], searchName+nameIndex];
        inserData(userAddSql,userAddSql_Params);
    }
    console.log('本次共存储'+datasss.length+'条数据');
    // if(paindex == totalPage){
    //     // // 关闭 connection
    //     connection.end(function(err){
    //         if(err){
    //             console.log('connection end err - :'+err);
    //             return;
    //         }
    //         console.log('数据库链接关闭');
    //     });
    // }


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
startPa();