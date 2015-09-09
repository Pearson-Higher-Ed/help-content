var convertDoc = require('./lib/convertSingleDoc'),
  walk = require('fs-walk'),
  fs = require('fs');

var vargs = process.argv.slice(2);

var path = vargs[0];

var outputPath = './out/';

if(!path){
  throw "Path must be supplied as only argument (node index.js /path/to/files/to/convert)";
}

//walk the path
walk.walk(path, function(baseDir, fname, stat, next){
  var isDir = stat.isDirectory(),
    outParallel = baseDir.replace(path, outputPath) + fname,
    ext = fname.split('.');

  ext = ext[ext.length-1];
  fs.exists(outParallel, function(exists){
    if(isDir && !exists){
      // mkdir
      console.log('making dir', outParallel);
      fs.mkdir(outParallel, next);
    }
    else if(!isDir && ext == 'html'){
      convertDoc(baseDir + fname, function(e, out, outHtml){
        var outFname = outParallel.replace('.html', '.json');
        fs.writeFile(outParallel, outHtml, function(err){
          if(err){
            next(err);
          }else{
            fs.writeFile(outFname, out, function(err2){
              next(err2);
            });
          }
        });
      });
    }
  });
}, function(err){

  throw err;
});
