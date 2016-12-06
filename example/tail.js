var col = require('monk')('localhost/test').get('woot');
var setting = require('..')(col);
var assert = require('assert');

setInterval(function () {
  col.insert({ a: 'b', updateDate: new Date(), ts: Date.now() })
}, 1000);

setInterval(function () {
  console.log(setting.get('a'),setting.path);
},1000);

setInterval(function(){
  col.findOne({}).then(function(res){
    console.log(res)
  })
},10000);
