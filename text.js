const tiny  = require('./index')

//批量压缩
function BatchCompressionun (){
    tiny.compress('/Users/admin/Desktop/九宫格1','/Users/admin/Desktop/九宫格2222',process)
}

//批量的回调函数 (文件,进行的数量,总数)
function process(res,number,total){
    console.log('total: ', total);
    console.log('number: ', number);
    console.log('res: ', res);

}

//单个图片压缩
function  aSingleFile (){
    tiny.compressImg('/Users/admin/Desktop/zhoxin.jpg','/Users/admin/Desktop/test.jpg').then(res =>console.log("单个文件-->",res))
}

//执行运行函数
// BatchCompressionun()
aSingleFile()
