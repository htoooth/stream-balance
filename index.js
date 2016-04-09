var through = require("through2");

module.exports = balance 

function Pool(objects) {
  this._objects = [].concat(objects);
}

Pool.prototype = {
  gain: function() {
    return this._objects.pop();
  },
  release: function(obj, cb) {
    this._objects.unshift(obj);
    if (cb) cb();
  }
}

function balance(handleStreams, options) {
  var pool = new Pool(handleStreams);

  return through(options, function(chunk, _, cb) {
    var idle = pool.gain();
    if (typeof idle === "undefined") {
      this.unshift(chunk);
      cb();
    } else {
      idle.write(chunk);
      idle.once("data", function(data) {
        pool.release(stream);
        cb(null, data);
      });
    }
  });
}
