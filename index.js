const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');
const fse = require('fs-extra');
const exts = ['.jpg', '.png', '.jpeg'];
const max = 5200000; // 5MB == 5242848.754299136
const Files = require('./files');

//   接口的基础信息
function getOptions() {
  var time = Date.now();
  let UserAgent =
    'Mozilla/5.0(WindowsNT10.0;Win64;x64)AppleWebKit/537.36(KHTML,likeGecko)Chrome/' +
    59 +
    Math.round(Math.random() * 10) +
    '.0.3497.' +
    Math.round(Math.random() * 100) +
    'Safari/537.36';
  var options = {
    method: 'POST',
    hostname: 'tinypng.com',
    path: '/web/shrink',
    headers: {
      rejectUnauthorized: false,
      'Postman-Token': (time -= 5000),
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UserAgent,
      'X-Forwarded-For': getIp(),
      Cookie: ''
    }
  };
  return options;
}

// 更换IP地址
function getIp() {
  var _ = {
    random: function(start, end) {
      return parseInt(Math.random() * (end - start) + start);
    }
  };
  var ip =
    _.random(1, 254) +
    '.' +
    _.random(1, 254) +
    '.' +
    _.random(1, 254) +
    '.' +
    _.random(1, 254);
  return ip;
}

class TinyPng {
  /**
   * 单独压缩图片
   * @param {压缩文件入口}} from
   * @param {压缩文件出口} out
   */
  static async compressImg(from, out) {
    if (!from) {
      throw new Error('请传入正确的from');
    }
    if (!out) {
      out = from;
    }
    var exists = await fse.exists(from);
    if (!exists) {
      throw new Error('传入的文件不存在');
    }
    var res = await new Promise((resolve, reject) => {
      try {
        var req = https.request(getOptions(), res => {
          res.on('data', buf => {
            let obj;
            try {
              obj = JSON.parse(buf.toString());
            } catch (error) {
              reject(new Error('解析返回值失败'));
            }
            if (obj.error) {
              reject(obj.error);
            } else {
              this.saveImg(out, obj)
                .then(saveRes => {
                  let fileName = this.getNameByUrl(from)
                  resolve({...saveRes,fileName});
                })
                .catch(error => {
                  console.log('error');
                  reject(error);
                });
            }
          });
        });
        fse
          .readFile(from)
          .then(data => {
            req.write(data, 'binary');
            req.on('error', e => {
              reject(e);
            });
            req.end();
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
    return res;
  }
  /**
   * 压缩文件夹内所有的图片
   * @param {文件入口} from
   * @param {文件出口} out
   * @param {回调函数(文件,进行第几个,总数)} onprogress
   */
  static async compress(from, out, onprogress) {
    if (!from) {
      throw new Error('请传入要压缩的文件夹');
    }
    if (!out) {
      out = from;
    }
    var imagelist = await this.getAllImg(from);
    if (!imagelist || imagelist.length == 0) {
      throw new Error('没有获取到图片文件');
    }
    var total = imagelist.length;
    var compressed = 0;
    for (var i in imagelist) {
      let curpath = imagelist[i].path;
      //这边在判断一下是否是图片文件吧--
      let relative = path.relative(from, curpath);
      let outputPath = path.resolve(out, relative);
      TinyPng.compressImg(curpath, outputPath)
        .then(res => {
          compressed++;
          if (!!onprogress) {
            onprogress(res, compressed, total);
          }
        })
        .catch(err => {
          compressed++;
          onprogress(false, compressed, total,err);
        });
    }
    return true;
  }

  static getNameByUrl (url){
   let index =  url.split("/").length;
   return url.split("/")[index-1]
  }

  /**
   * 保存文件夹
   * @param {写入图片地址} imgpath 
   * @param {文件留} obj 
   */
  static saveImg(imgpath, obj) {
    return new Promise((resolve, reject) => {
      let options = new URL(obj.output.url);
      let req = https.request(options, res => {
        let body = '';
        res.setEncoding('binary');
        res.on('data', function(data) {
          body += data;
        });
        res.on('end', function() {
          Files.createdirAsync(path.dirname(imgpath)).then(res => {
            fs.writeFile(imgpath, body, 'binary', err => {
              if (err) {
                reject(err);
                return;
              }
              resolve(obj);
            });
          });
        });
      });
      req.on('error', e => {
        reject(e);
        console.error(e);
      });
      req.end();
    });
  }

  /**
   * 
   * @param {*} file 
   */
  static async getAllImg(file) {
    var imgs = await Files.getTree(file, false, null, function(file) {
      return !!path.extname(file) && !exts.includes(path.extname(file));
    });
    let removeIndex = imgs.findIndex((value)=>{
      return value.name === '.DS_Store';
    })
    if(removeIndex !== -1){
      imgs.splice(removeIndex,1)
    }
    return imgs;
  }
}

module.exports = TinyPng;
