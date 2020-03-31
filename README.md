---
description: 基于tinyPng图片压缩工具。
---

# tinypngjs

## 安装

```bash
目前为推送到npm     可直接查看demo
npm install 
node example.js
```


## API

#### TinyPng.compress (fromFolder,outFolder,onProgress);

 
参数：

* fromFolder：需要压缩的文件夹
* outFolder：压缩后图片保存的文件夹
  * 可选
  * 默认值=fromFolder
* onProgress：下载进度回调

  回调函数：function(res,percent,total){}

  * res: Object,tinyjs压缩图片后返回的json
  * percent：Number当前进度
  * total:所有文件夹数量


返回值 Promise

```javascript
var res = await TinyPng.compress("./a/");
```



#### TinyPng.compressImage(fromImg,outImg);
  
参数：

* fromImg：需要压缩的图片路径
* outFolder：压缩后图片的图片路径
  * 可选
  * 默认值=fromImg

返回值 Promise

```javascript
var res = await TinyPng.compressImg("./a/1.jpg");
```



## 客户端版 todo

 


