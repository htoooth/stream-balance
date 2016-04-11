var inherits = require('inherits');
var stream = require('readable-stream');
var Promise = require("bluebird");
var R = require('ramda');

module.exports = balance;

function balance(streams, opts) {
  var forks = Fork.obj(streams, opts);
  return forks;
}

function Fork(streams, opts) {
  opts = opts || {}
  stream.Duplex.call(this, opts)

  this._idle = streams.length;
  this._needDrain = false;
  this._streams = streams;

  addState(this._streams);
}

function addState(streams) {
  R.forEach(function(i) {
    i._idle = true;
  }, streams);
}

inherits(Fork, stream.Duplex)

Fork.obj = function(readable, writable, opts) {
  opts = opts || {};
  opts.objectMode = true;
  return new Fork(readable, writable, opts)
}

Fork.prototype._checkFull = checkFull;

function checkFull() {
  if (this._idle === 0) {
    this._needDrain = true;
  };

  if (this._idle != 0 && this._needDrain) {
    this._needDrain = false;
    this.emit('drain');
  }

  return !(this._idle === 0);
}

Fork.prototype.write = function(chunk, encoding, callback) {
  var self = this;
  this._idle--;

  var index = R.findIndex(R.propEq("_idle", true))(this._streams);

  this._handle(self, index, chunk).then(function(result) {
    self._idle++;
    self.push(result[1]);
    console.log("stream:" + result[0] + ":finish:" + result[1]);
    self._checkFull();
  }, function(err) {
    // Todo 重复处理 3 次
    // TODO 错误处理
  });

  if (callback) callback();

  return this._checkFull();
}

Fork.prototype._handle = function(self, index, chunk) {
  return new Promise(function(resolve, reject) {
    if (index == -1) {
      reject("no stream");
      return;
    }

    var currStream = self._streams[index];
    currStream._idle = false;

    console.log("stream:" + index + ":processing:" + chunk.toString());

    currStream.write(chunk);

    var readCallback = function(data) {
      currStream.removeListener("error", errorCallback);
      resolve([index, data]);
      currStream._idle = true;
    }

    var errorCallback = function() {
      currStream.removeListener("data", readCallback);
      reject("error");
      currStream._idle = false;
    }

    currStream.once("data", readCallback);
    currStream.once("error", errorCallback);

  });
}


Fork.prototype._read = function() {}
