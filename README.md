一个小型的ajax库，提供开箱即用的ajax方法。

## Install

[min]: https://github.com/cweijan/ajax/blob/master/ajax.min.js
[max]: https://github.com/cweijan/ajax/blob/master/ajax.js

```
npm install ajax-j
```

## Usage

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

## Other Tool Method

```javascript

// using es6 module
import ajaxJ from 'ajax-j'

ajaxJ.get(url,param,successCallback)
ajaxJ.post(url,param,successCallback)
//send post request, Content-Type is "application/json; charset=utf-8"
ajaxJ.postJson(url,param,successCallback) 

// or you can using promise
ajax.get(url,param).then(response=>{
    console.log(response)
}).catch(xhr=>{
    console.log(xhr)
})


// if import script direct, invoke method is:
get(url,param)
post(url,param)
postJson(url,param)

```

param table：

| param | default | desc | type |
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