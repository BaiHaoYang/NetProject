"use strict"
const fs = require("fs");
const querystring = require('querystring');



class DownloadSection{
    constructor(section){
        let { url, part, method, start, end,buffer,path} = section;
        this._url = url;
        this._part = part;
        this._method =method;
        this._start = start;
        this._end = end;
        this._buffer = buffer;
        this._path = path;

        this._total = end-start;

        this._length = 0;
        this._writeStream = null;
        this._req = null;
        this._resp = null;
    }
    control(){
        let me = this;
        this._res.on('data',function(chunk){
            me.res_data_handler(chunk,me);
        });
        this._res.on('error',function(e){
            me.res_error_handler(e,me);
        });
        this._res.on('end',function(){
            me.res_end_handler(me);
        });
        this._writeStream.on('drain', function() { me._res.resume(); });
    }

    async start(){
        try{
            let me = this;
            let {opts , http } = Download.buildOpts(this._url);
            opts.url = me._url;
            opts.headers = {
                'Range':'bytes='+ me._start+'-'+me._end,
                'Connection':'keep-alive'
            };
            let {res,req} = await Download.doReqAsync(opts);
            me._total = parseInt(res.headers['content-length']);

            me._writeStream = fs.createWriteStream(me._path,{
                bufferSize:me._buffer,
                flags:'r+',
                start:me._start
            });


            this._res = res;
            this._req = req;
            me.control();
        }catch(e){
            console.error(e);
        }
    }

    res_data_handler(chunk,me){
        me._length += chunk.length;
        // console.log(me._part+'-length='+me._length+'-start='+me._start+'-end='+me._end+'--'+(Math.ceil(me._length/(me._end-me._start)*10000)/100));
        if (me._writeStream.write(chunk) === false) {
            me._res.pause();
        }
    }
    res_error_handler(e,me){
        if (me._writeStream != null)
            me._writeStream.end();
        console.log(e)
    }
    res_end_handler(me){
        if (me._total === me._length) {
            // TODO
            // console.log(me._part+' success')
            me._writeStream.end();
        }else{
            // console.log(me._part+' - fail:'+me._length+'/'+me._total);
            if (me._writeStream != null)
                me._writeStream.end();
        }
    }




}
class Download{
    constructor(url,path,MAX_BUFFER,THREAD) {
        this.path = path;
        this.url = url
        this.MAX_BUFFER = MAX_BUFFER;
        this.THREAD = THREAD;

    }
    async start(){
        let me = this;
        let thread = me.THREAD;
        let {statusCode,headers} = await Download.getHeaders(this.url);
        console.log('statusCode='+statusCode);
        console.log(headers);
        let contentLength = parseInt(headers['content-length'])
        let sections = [];
        // 多个进程下载
        let size = Math.ceil(contentLength/thread)+1;
        for(let i = 0 ;i<thread;i++){
            let start = i*size;
            let end = (i+1)*size+1;
            if(i==thread-1){
                end ='';
            }
            sections.push({
                path:me.path,
                url:me.url,
                part:i,
                method:'GET',
                start:start,
                end:end,
                buffer:me.MAX_BUFFER
            });
        }

        await Download. writeFileAsync(me.path,'');

        me.sections = [];
        sections.forEach(function(section){
            let ds = new DownloadSection(section);
            me.sections.push(ds);
            ds.start();
        });
    }

    static buildOpts(url){
        let http = null;
        let reg = new RegExp(/^http:\/\/([^:\/]+)[:]*(\d*)(\/[^$]*)$/)
        let ret = reg.exec(url);
        if(ret==null){
            reg = new RegExp(/^https:\/\/([^:\/]+)[:]*(\d*)(\/[^$]*)$/)
            ret = reg.exec(url);
            http = require('https');
        }else{1
            http = require('http');
        }
        let opts = {
            hostname: ret[1],
            port: ret[2],
            path: ret[3],
            method :'GET',
            headers: {}
        };
        return {opts:opts,http:http};
    }
    static async getHeaders(url,method='HEAD'){
        return new Promise(function (resolve, reject) {
            let {opts , http } = Download.buildOpts(url);
            opts.method = method;
            let req = http.request(opts, function(res){
                resolve({
                    statusCode: res.statusCode,
                    headers:res.headers
                });
            });
            req.on('error', function(e){
                reject(e);
            });
            req.end();
        })
    }
    static getHttp(url){
        let http = null;
        let reg = new RegExp(/^http:\/\/([^:\/]+)[:]*(\d*)(\/[^$]*)$/)
        let ret = reg.exec(url);
        if(ret==null){
            reg = new RegExp(/^https:\/\/([^:\/]+)[:]*(\d*)(\/[^$]*)$/)
            ret = reg.exec(url);
            http = require('https');
        }else{
            http = require('http');
        }
        return http;

    }
    static async doReqAsync(opts){
        return new Promise(function (resolve, reject) {
            let http = Download.getHttp(opts.url);
            let req = http.request(opts, function(res){
                resolve({ req:req, res:res })
            });
            req.on('error', function(e){
                reject(e);
            });
            req.end();
        });
    }
    static async writeFileAsync(path,content){
        return new Promise(function(resolve,reject){
            fs.writeFile(path , content, function(err) {
                if(err) {
                    reject(err);
                }else{
                    resolve(true);
                }
            });
        });
    }
    static async postForm(url,json){
        return new Promise(function(resolve,reject){
            let contents = querystring.stringify(json);
            var options = {
                host: 'www.joey.com',
                path: '/application/node/post.php',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': contents.length
                }
            };
            var req = http.request(options, function(res){
                res.setEncoding('uft8');
                resolve({ req:req, res:res })
                res.on('data', function(data){
                    console.log(data);
                });

            });
            req.write(contents);
            req.on('error', function(e){
                reject(e);
            });
            req.end();

        });
    }
}



async function run(name,url){

    let dl = new Download(url,name,1*1024*1024,20);
    dl.start();


    let id = setInterval(function(){
        if(typeof dl.lastLength =='undefined'){
            dl.lastLength = 0;
        }
        let total = 0;
        let length = 0;
        try {
            dl.sections.forEach(function (s) {
                total += s._total;
                length += s._length;
            });
        }catch (err){
            console.log(err);
        }
        let speed =parseInt((length - dl.lastLength)/(1024*1024)*100)/100;
        dl.lastLength = length;
        console.log(name+':'+length+'/'+total +'-'+ (parseInt(length/total*10000)/100)+'% - speed='+speed+'M/s');
        if(length==total){
            clearInterval(id);
            console.log('完成');
        }
    },1*1000)

}



// run('av94290DDDDDDD2231','http://p06aj8gat.bkt.clouddn.com/tumblr_okq0suX4lT1qc940m.mp4');
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
var tableName = 'thumTab'
var  sql = 'SELECT * FROM ' +tableName +" limit 61,10";
//查
function queryDb() {
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        for(var i = 0; i < result.length ; i++){
            // console.log(result[i].length);
            run(result[i].name,result[i].urls);
        }

        console.log('------------------------------------------------------------\n\n');
});
}
queryDb();
