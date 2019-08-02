一个小型的ajax库，提供开箱即用的ajax方法。

示例：

```javascript
ajax({
    type:"post",
    url:"", //添加自己的接口链接
    timeOut:5000,
    before:function(data){
      console.log("请求发送的数据:"+data);  
    },
    success:function(response){
        console.log(response);
    },
    error:function(xhr){
        console.log("error:"+xhr.status);
    },
    complte:function(xhr){
        console.log("complte:"+xhr.status);
    }
});
```

除了ajax方法外,还提供了封装的函数

```javascript
standard.get(url,data,successCallback)
standard.post(url,data,successCallback)

//发送Content-Type为application/json; charset=utf-8的数据
standard.postJson(url,data,successCallback) 
```

参数表：

| 参数 | 默认值 | 描述 | 可选值 |
|:----|:----|:----|:----|
| url | "" | 请求的链接 | string |
| method | get | 请求的方法 | get,post,json |
| data | null | 请求的数据 | object,string,FormData,array |
| contentType | "" | 请求头 | string |
| dataType | "" | 请求的类型 | jsonp |
| async | true | 是否异步 | blooean |
| timeOut | undefined | 超时时间 | number |
| before | function(data){} | 发送之前执行的函数 | function |
| success | function(response){} | 请求成功的回调函数 | function |
| error | function(xhr){} | 请求报错执行的函数 | function |
| complete | function(xhr){} | 请求结束的回调函数 | function |

min版本使用 [javascript-minifier](https://javascript-minifier.com/)进行压缩