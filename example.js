var fromArray = require("stream-from-array");
var through = require("through2");
var balance = require("./");

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

fromArray(num).pipe(balance([handle, handle1, handle2, handle3])).pipe(process.stdout);
