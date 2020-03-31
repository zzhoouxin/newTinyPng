const fse = require("fs-extra");
const path = require("path");
class Files {

    // 创建文件夹方法
    static async createdirAsync(src) {
        let exists = await fse.exists(src);
        if (exists) {
            return true;
        }
        var res = await new Promise((result, reject) => {
            this.createdir(src, success => {
                if (!!success) {
                    result(success);
                } else {
                    reject("创建文件失败");
                }
            });
        });
        return res;
    }

    // 创建文件夹
    static createdir(src, callback) {
        let parentdir = path.dirname(src);
        fse.exists(parentdir, function(exists) {
            if (!exists) {
                Files.createdir(parentdir, function() {
                    try {
                        fse.mkdir(src, function() {
                            //创建目录
                            callback(src);
                        });
                    } catch (error) {
                        callback(false, error);
                    }
                });
            } else {
                fse.exists(src, function(exists) {
                    if (exists) {
                        //存在
                        callback(src);
                    } else {
                        //bu存在
                        try {
                            fse.mkdir(src, function() {
                                //创建目录
                                callback(src);
                            });
                        } catch (error) {
                            callback(false, error);
                        }
                    }
                });
            }
        });
    }
    static getTree(src, istree, folder,testfun) {
        debugger
        if (!folder) {
            folder = [];
        }
        if (typeof istree == "undefined") {
            istree = true;
        }
        return new Promise(function(result, reject) {
            fse.pathExists(src, function(err, exists) {
                if (!!err) {
                    reject(err);
                    return;
                }
                if (!exists) {
                    result(folder);
                }
                fse.readdir(src, function(err, paths) {
                    if (!err) {
                        var promisArr = [];
                        var length = paths.length;
                        var done = 0;
                        if(length==0){
                            result(folder);
                        }
                        paths.forEach(function(curpath) {
                            if(!!testfun&&testfun(curpath)){
                                done++;
                                return true;
                            }
                            var _src = path.resolve(src,curpath);
                            // console.log(_src);
                            var filestat = fse.statSync(_src);
                            if (filestat) {
                                if (filestat.isDirectory()) {
                                    var saveArr = folder;
                                    if (istree) {
                                        var _folder = {
                                            name: curpath,
                                            children: []
                                        };
                                        folder.push(_folder);
                                        saveArr = _folder["children"];
                                    }

                                    Files.getTree(_src, istree, saveArr,testfun)
                                        .then(function(res) {
                                            done++;
                                            if (done >= length) {
                                                result(folder);
                                            }
                                        })
                                        .catch(function() {
                                            done++;
                                            if (done >= length) {
                                                result(folder);
                                            }
                                        });
                                } else {
                                    done++;
                                    folder.push({
                                        path: _src,
                                        name: path.basename(_src)
                                    });
                                    if (done >= length) {
                                        result(folder);
                                    }
                                }
                            } else {
                                done++;
                                reject("获取文件状态失败");
                            }
                        });
                    } else {
                        reject(err);
                    }
                });
            });
        });
    }

}

module.exports = Files;