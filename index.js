const monk = require('monk');
const debug = require('debug')('msetting');
const Configstore = require('configstore');
const co = require('co');

module.exports = MSetting;

function MSetting(collection) {
  if (!(this instanceof MSetting)) return new MSetting(collection);
  this.collection = collection || monk('127.0.0.1:27017/local').get('setting');
  // read from   local store first
  this.conf = new Configstore(this.collection.name);
  var self = this;
  co(function*() {
    yield self.update();
  });
  return this.conf;
}

MSetting.prototype.update = function* update() {
  // set query options
  var opt = {
    tailable: true,
    awaitdata: true,
    timeout: false,
    numberOfRetries: -1
  };

  try {
    if (!this.qry) {
      // set query if first tail
      var doc = yield this.collection.findOne({}, { sort: { ts: -1 } });
      var qry = { ts: {} };
      if (doc != null) {
        debug('first tail', doc.ts);
        qry.ts = { $gte: doc.ts };
      } else {
        debug('first tail', 'Date.now()');
        yield this.collection.insert({ ts: 0 }); // start!
        qry.ts = { $gte: Date.now() }
      }
      this.qry = qry;
    }

    debug('tailing with %j', this.qry);
    // query
    yield this.collection.find(this.qry, opt).each(doc=>this.op(doc)).catch(function (err) {
      throw err;
    });
  } catch (e) {
    yield this.update();
  }
};

MSetting.prototype.query = function (qry) {
  debug('setting query to %j', qry);
  this.qry = qry;
  return this;
};

MSetting.prototype.op = function (doc) {
  this.query({ ts: { $gt: doc.ts } });
  this.conf.set(doc);
};
