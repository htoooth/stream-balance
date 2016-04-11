var through = require("through2");
var async = require("async");
var pipeline = require('pumpify')

module.exports = balance;

function buffList(n) {
  var buf = [];
  return through.obj(function(chunk, _, cb) {
    buf.push(chunk);
    if (buf.length == n) {
      this.push(buf);
      buf = [];
    }
    cb();
  }, function(cb) {
    if (buf.length != 0) {
      this.push(buf);
    }
    cb();
  });
}

function flatArray() {
  return through.obj(function(chunk, _, cb) {
    for (var i = chunk.length - 1; i >= 0; i--) {
      this.push(chunk[i]);
    }
    cb();
  });
}

function fork(streams) {
  function initStreams(streams) {
    for (var i = streams.length - 1; i >= 0; i--) {
      streams[i]._idle = true;
    }
  }

  function handleData(streams, item, cb) {
    async.detect(streams, function(stream, callback) {
      callback(null, stream._idle);
    }, function(err, result) {
      if (typeof result === "undefined") {
        setImmediate(handleData, streams, item, cb);
        return;
      }
      result._idle = false;
      result.write(item);
      result.once("data", function(data) {
        result._idle = true;
        cb(null, data);
      });
    });
  }

  initStreams(streams);

  return through.obj(function(chunk, _, cb) {
    var self = this;
    async.map(chunk, function(item, callback) {
      handleData(streams, item, callback);
    }, function(err, results) {
      self.push(results);
      initStreams(streams);
      cb();
    });
  });
}

function balance(streams) {
  return pipeline(buffList(streams.length), fork(streams), flatArray());
}
