var request = require('request'); 
var http = require('http');
var async = require('async');
var fs = require('fs');
var queue = async.queue(worker, 3);


var store = JSON.parse(fs.readFileSync('ids.json', 'utf8')) || [];

console.log('store.length', store.length);


for(var i = 1; i <= 3000; i++) {
  queue.push(i);
}

queue.drain = function() {
  console.log("all done");
  console.log(store);
}
 
function worker (i, callback) {
 
  if(inArray(i, store)) {
   console.log(i, 'skipped');
   callback();
   return;
  }

  var url = 'https://www.gstatic.com/prettyearth/'+i+'.json';

  console.log('worker', url);
  
  request.head(url, function (err, resp) {
    var id = i;
    console.log(i, resp.statusCode)
    if (resp.statusCode === 200) {
      store.push(id);
      fs.writeFile( "ids.json", JSON.stringify( store ), "utf8");
    }
    callback();
  });
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
