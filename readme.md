# stream-balance

```js
var balance = require("stream-balance");
var though = require("though2");
var fromArray = require("stream-from-array");

var stream = function(chunk, _, cb){
  setTimeout(function(){
    cb(null,parseInt(chunk));
  }, parseInt(Math.random()*5000 ,10));
};

var stringInt = ["1","2","3","4","5","6","7","9","10"];

var handle1 = though(stream);
var handle2 = though(stream);
var handle3 = though(stream);

fromArray(stringInt).pipe(balance([handle1,handle2,handle3])).pipe(process.stdout);

```