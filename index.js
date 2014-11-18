// Requires
var fs = require('fs');
var path = require('path');
var request = require('request');
var async = require('async');

// Globals
var OUT_DIR = path.join(__dirname, 'pretty-earth');
var imageIds = require('./imageIds.json');

if ( !fs.existsSync("./pretty-earth") ) {
  fs.mkdirSync("./pretty-earth");
}


var queue = async.queue(download, '4');
queue.drain = function() {
  console.log("\nAll done!");
}
queue.push(imageIds);


function writePhoto(photo) {
    var filename = [
        photo.geocode.country,
        photo.geocode.administrative_area_level_1,
        photo.id,
    ]
    .filter(Boolean)
    .map(function(str) {
        return str.replace(/S+/g, '-').toLowerCase();
    }).join('-') + '.jpg';

    var buffer = new Buffer(photo.dataUri.split(",")[1], 'base64');

    fs.writeFile(
        path.join(OUT_DIR, filename),
        buffer,
        function(err) {
            if(err) {
                console.error("Failed to write", photo.id, "because of", err);
            }
            console.log("Wrote", photo.id);
        }
    );
}

function download(id, cb) {
    var url = "https://www.gstatic.com/prettyearth/"+id+".json";
    var options = {
        url: url,
        json: true,
    };
    request.get(options, function(err, body, parsed) {
        if(err) {
            console.error("Failed to get [", id, "] because of", err);
            cb();
            return;
        }

        try {
            writePhoto(parsed);
            cb();
        } catch(errx) {
            console.error("Failed to write [", id, "] because of", errx);
            cb();
            return;
        }
    });
}
