var convertDoc = require('./lib/convertSingleDoc'),
  walk = require('fs-walk'),
  fs = require('fs'),
  path = require('path');

var vargs = process.argv.slice(2);

var inPath = vargs[0];

var outputPath = './out/';

if(!inPath){
  throw "Path must be supplied as only argument (node index.js /path/to/files/to/convert)";
}

//walk the path
walk.walk(inPath, function(baseDir, fname, stat, next){
  if(fname == '.svn'){
    next();
  }
  var isDir = stat.isDirectory(),
    outParallel = path.join(baseDir.replace(inPath, outputPath), fname),
    ext = path.extname(fname);

  fs.exists(outParallel, function(exists){
    if(isDir && !exists){
      // mkdir
      console.log('making dir', outParallel);
      fs.mkdir(outParallel, function(){
        next();
      });
    }
    else if(!isDir && ext == '.html'){
      convertDoc(path.join(baseDir, fname), function(e, out, outHtml){
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
    else{
      next();
    }
  });
}, function(err){

  throw err;
});
