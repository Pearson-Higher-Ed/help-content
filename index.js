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
  if(fname == '.svn' || baseDir.indexOf('.svn') > -1){
    next();
    return;
  }
  var isDir = stat.isDirectory(),
    outParallel = path.join(baseDir.replace(inPath, outputPath), fname).toLowerCase(),
    ext = path.extname(fname);

  fs.exists(outParallel, function(exists){
    if(isDir && !exists){
      // mkdir
      console.log('making dir', outParallel);
      fs.mkdir(outParallel, function(){
        next();
      });
    }
    else if(!isDir){
      convertDoc(path.join(baseDir, fname), function(e, out, outHtml){
        var outFname = outParallel.replace(/(\.html|\.htm)/i, '.json');
        fs.writeFile(outParallel, outHtml, function(err){
          if(err){
            next(err);
          }else{
            fs.writeFile(outFname, JSON.stringify(out, null, '  '), function(err2){
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
  if(err){
    console.log(err);
  }
});
