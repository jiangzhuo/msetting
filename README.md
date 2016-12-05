# msetting

Using MongoDB as a centralized configuration  

###Usage  

```
var col = require('monk')('localhost/test').get('woot');
var setting = require('msetting')(col);

setInterval(function () {
  console.log(444444444);
  col.insert({ a: 'b', updateDate: new Date(), ts: Date.now() })
}, 1000);

setInterval(function () {
  console.log(setting.get('a'));
}, 1000);
```  

for more detail see source code and [cofigstore](https://github.com/yeoman/configstore)  

###TODO
1. bootstrap process
2. error process