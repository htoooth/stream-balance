var fromArray = require("stream-from-array");
var through = require("through2");
var balance = require("./balance2");

var stream1 = function(chunk, _, cb) {
  setTimeout(function() {
    console.log("stream1:" + chunk);
    cb(null, chunk);
  }, 5000);
}

var stream2 = function(chunk, _, cb) {
  setTimeout(function() {
    console.log("stream2:" + chunk);
    cb(null, chunk);
  }, 3000);
}

var stream3 = function(chunk, _, cb) {
  setTimeout(function() {
    console.log("stream3:" + chunk);
    cb(null, chunk);
  }, 8000);
}

var stream4 = function(chunk, _, cb) {
  setTimeout(function() {
    console.log("stream4:" + chunk);
    cb(null, chunk);
  }, 7000);
}

var handle = through(stream1);
var handle1 = through(stream2);
var handle2 = through(stream3);
var handle3 = through(stream4);

num = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

var read = fromArray(num);
var bala = balance([handle, handle1, handle2, handle3]);

bala.on("data", function() {
  console.log("balance");
});

read.pipe(bala).pipe(through.obj(function(chunk, _, cb) {
  console.log("result:" + chunk);
  cb();
}));
