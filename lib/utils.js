const errorUtils = require('./ErrorUtils');

let utils = {
    base(obj, vType) {
        return Object.prototype.toString.call(obj) === `[object ${vType}]`;
    },

    isArray(obj) { return this.base(obj, 'Array'); },

    isFunction(obj) { return this.base(obj, 'Function'); },

    isString(obj) { return this.base(obj, 'String'); },

    isObject(obj) { return this.base(obj, 'Object'); },

    isNumber(obj) {
        let n = Number(obj);
        return this.base(n, 'Number') && !isNaN(n);
    },

    isEmpty(obj) {
        return obj == undefined || obj == null || obj == 'null' || obj == '' || obj.length == 0;
    },

    isEmptyObject(obj){
        for (var t in obj)
            return false;
        return true;
    },

    resJson(res, code = 0, data = null, message = null) {
        let obj = { code: code, data: data };
        if (message != null) obj.message = message;
        res.json(obj);
    },

    reqJson(query) {
        if (typeof (query) == "object") return query;
        if (!utils.isEmpty(query)) {
            return JSON.parse(query);
        }
        return {};
    },

    success(res, obj) {
        utils.resJson(res, 0, obj, '操作成功');
    },

    error(res, err) {
        utils.resJson(res, err.code || 2000, null, err.message);
    },

    getRealIp(req) {
        let real_ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
        if (real_ip === "::1") real_ip = "127.0.0.1";
        return real_ip.match(/\d+/g).join('.');
    },

    getParams(req){
        let paramsFrom ;
        if(!utils.isEmptyObject(req.query)) paramsFrom = req.query;
        if(!utils.isEmptyObject(req.body)) paramsFrom = req.body;
        if(!utils.isEmptyObject(req.params)) paramsFrom = req.params;
        return paramsFrom;
    },

    getParam(req, key){
        return req.params[key] || req.body[key] || req.query[key];
    },

    getMissingParams(req, keys) {
        let missing = [];
        if(! utils.isArray(keys))
            keys = [keys];
        keys.forEach(key => {
            let val = utils.getParam(req, key);
            if(! val) missing.push(key)
        });

        return missing;
    },

  /**
   * 确保参数存在，否则返回异常
   * @param req
   * @param res
   * @param keys
   * @returns {boolean}
   */
    ensureParams(req, res, keys) {
        let missing = utils.getMissingParams(req, keys);
        if(missing.length) {
            utils.error(res, errorUtils.params_missing_error(missing));
            return false;
        }
        return true;
    },

    postPermissions:{
        Post_Permission_Forward : 1,   //文章允许转发，默认允许
        Post_Permission_Liked: 2,   //文章允许打分、点赞，默认允许
        Post_Permission_Buyout:  4,   //文章允许出售收益，默认允许
        Post_Permission_Comment: 8,   //文章允许评论，默认允许
        Post_Permission_Reward:16  
    }

};
export default utils;