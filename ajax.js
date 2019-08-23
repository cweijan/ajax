(function (window, undefined) {

    function ajax(options) {

        function convertToFormData() {
            var formData = new FormData()
            for (var key in data) {
                if (data[key]) formData.append(key, data[key])
            }
            return formData;
        }

        function existsFile(data) {
            for (var key in data) {
                if (data[key] && data[key].__proto__.toString() === "[object File]") {
                    return true;
                }
            }
            return false;
        }

        function processFormData() {
            if (data instanceof FormData) {
                var temp = {};
                data.forEach(function (value, key) {
                    if (value) temp[key] = value;
                });
                data = temp
            }
        }

        //编码数据
        function setData() {
            if (typeof data === "function") {
                data = data()
            }

            //设置对象的遍码
            function setObjData(data, parentName) {
                function encodeData(name, value, parentName) {
                    var items = [];
                    name = parentName === undefined ? name : parentName + "[" + name + "]";
                    if (typeof value === "object" && value !== null) {
                        items = items.concat(setObjData(value, name));
                    } else {
                        name = encodeURIComponent(name);
                        value = encodeURIComponent(value);
                        if (value != "null" && value != "undefined" && value) items.push(name + "=" + value);
                    }
                    return items;
                }

                var arr = [], value;
                if (Object.prototype.toString.call(data) == '[object Array]') {
                    for (var i = 0, len = data.length; i < len; i++) {
                        value = data[i];
                        arr = arr.concat(encodeData(typeof value == "object" ? i : "", value, parentName));
                    }
                } else if (Object.prototype.toString.call(data) == '[object Object]') {
                    for (var key in data) {
                        value = data[key];
                        arr = arr.concat(encodeData(key, value, parentName));
                    }
                }
                return arr;
            }

            //设置字符串的遍码，字符串的格式为：a=1&b=2;
            function setStrData(data) {
                var arr = data.split("&");
                for (var i = 0, len = arr.length; i < len; i++) {
                    var name = encodeURIComponent(arr[i].split("=")[0]);
                    var value = encodeURIComponent(arr[i].split("=")[1]);
                    if (value != "null" && value != "undefined" && value) arr[i] = name + "=" + value;
                }
                return arr;
            }


            if (/\bjson\b/.test(contentType) || method === "json") {
                processFormData();
                data = JSON.stringify(data)
                method = 'post'
            } else if (data) {
                if (typeof data === "string") {
                    data = setStrData(data);
                } else if (method !== "get" && typeof data === "object" && existsFile(data)) {
                    data = convertToFormData()
                    method = "formPost"
                    return
                } else if (method !== "get" && data instanceof FormData) {
                    method = "formPost"
                    return
                } else if (typeof data === "object") {
                    processFormData();
                    data = setObjData(data);
                }
                data = data.join("&").replace("/%20/g", "+");
                //若是使用get方法或JSONP，则手动添加到URL中
                if (method === "get" || dataType === "jsonp") {
                    url += url.indexOf("?") > -1 ? (url.indexOf("=") > -1 ? "&" + data : data) : "?" + data;
                }
            }
        }

        // JSONP
        function createJsonp() {
            before();
            var script = document.createElement("script"),
                timeName = new Date().getTime() + Math.round(Math.random() * 1000),
                callback = "JSONP_" + timeName;

            window[callback] = function (data) {
                clearTimeout(timeout_flag);
                document.body.removeChild(script);
                success(data);
            }
            script.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "callback=" + callback;
            script.type = "text/javascript";
            document.body.appendChild(script);
            setTime(callback, script);
        }

        //设置请求超时
        function setTime(callback, script) {
            if (timeOut !== undefined) {
                timeout_flag = setTimeout(function () {
                    if (dataType === "jsonp") {
                        delete window[callback];
                        document.body.removeChild(script);

                    } else {
                        timeout_bool = true;
                        xhr && xhr.abort();
                    }
                    console.log("timeout");

                }, timeOut);
            }
        }

        /**
         * 对返回的数据进行包装处理
         * @param xhr
         */
        function xhrWrap(xhr) {
            var xhrWrapper = {}
            xhrWrapper.responseURL = xhr.responseURL
            xhrWrapper.statusText = xhr.statusText
            xhrWrapper.withCredentials = xhr.withCredentials
            xhrWrapper.responseText = xhr.responseText
            xhrWrapper.status = xhr.status
            xhrWrapper.contentType = xhr.getResponseHeader("Content-Type")
            var responseText = xhrWrapper.responseText
            if (/\bjson\b/.test(xhrWrapper.contentType)) {
                try {
                    xhrWrapper.response = JSON.parse(responseText)
                } catch (e) {
                    xhrWrapper.response = responseText
                    xhrWrapper.statusText = "json parse error"
                }
            }
            return xhrWrapper
        }

        // XHR
        function createXHR() {
            //由于IE6的XMLHttpRequest对象是通过MSXML库中的一个ActiveX对象实现的。
            //所以创建XHR对象，需要在这里做兼容处理。
            function getXHR() {
                if (window.XMLHttpRequest) {
                    return new XMLHttpRequest();
                } else {
                    //遍历IE中不同版本的ActiveX对象
                    var versions = ["Microsoft", "msxm3", "msxml2", "msxml1"];
                    for (var i = 0; i < versions.length; i++) {
                        try {
                            var version = versions[i] + ".XMLHTTP";
                            return new ActiveXObject(version);
                        } catch (e) {
                        }
                    }
                }
            }

            //创建对象。
            xhr = getXHR();
            xhr.open(method, url, async);
            //设置请求头
            if (method === "post" && method !== "formPost" && !contentType) {
                //若是post提交，则设置content-Type 为application/x-www-four-urlencoded
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            } else if (contentType) {
                xhr.setRequestHeader("Content-Type", contentType);
            }
            //添加监听
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    xhr = xhrWrap(xhr)
                    if (timeOut !== undefined) {
                        //由于执行abort()方法后，有可能触发onreadystatechange事件，
                        //所以设置一个timeout_bool标识，来忽略中止触发的事件。
                        if (timeout_bool) {
                            return;
                        }
                        clearTimeout(timeout_flag);
                    }
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        success(xhr.response);
                    } else {
                        error(xhr);
                    }
                    complete(xhr)
                }
            };
            //发送请求
            let sendData = method === "get" ? null : data;
            before(sendData);
            xhr.send(sendData);
            setTime(); //请求超时
        }


        var url = options.url || "", //请求的链接
            method = ((options.type || options.method) || "get").toLowerCase(), //请求的方法,默认为get
            data = options.data || null, //请求的数据
            contentType = options.contentType || "", //请求头
            dataType = options.dataType || "", //请求的类型
            async = options.async === undefined ? true : options.async, //是否异步，默认为true.
            timeOut = options.timeOut, //超时时间。 
            before = options.before || function () {
            }, //发送之前执行的函数
            error = options.error || function () {
            }, //错误执行的函数
            success = options.success || function () {
            }, //请求成功的回调函数
            complete = options.complete || function () {
            }; //请求结束的回调函数
        var timeout_bool = false, //是否请求超时
            timeout_flag = null, //超时标识
            xhr = null; //xhr对角
        setData();

        if (dataType === "jsonp") {
            createJsonp();
        } else {
            createXHR();
        }
    }

    window.ajax = ajax;
    window.post = function (url, data, callback) {
        if (typeof data === "function") {
            callback = callback ? callback : data
            data = null
        }
        ajax({
            url: url, method: 'POST', data: data, success: callback
        })
    }
    window.get = function (url, data, callback) {
        if (typeof data === "function") {
            callback = callback ? callback : data
            data = null
        }
        ajax({
            url: url, method: 'get', data: data, success: callback
        })
    }
    window.postJson = function (url, data, callback) {
        if (typeof data === "function") {
            callback = callback ? callback : data
            data = null
        }
        ajax({
            url: url, method: 'POST', data: data, success: callback, contentType: "application/json; charset=utf-8"
        })
    }
})(window);
