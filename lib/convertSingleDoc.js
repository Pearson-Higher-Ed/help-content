var sani = require('sanitize-html'),
  cheerio = require('cheerio'),
  whitelistTags = require('./whitelist-tags'),
  fs = require('fs');

var saniOpts = {
  allowedTags: whitelistTags
};

// these are duplicate for now, may change in the future
var businessSaniOpts = {
  allowedTags: whitelistTags
}

module.exports = function(filepath, cb){
  cb = cb || function(err, json, html){}

  fs.readFile(filepath, function(err, data){

    if(err){
      cb(err, null, null);
    }
    else{
      var $ource = cheerio.load(data)
        title = sani($ource('h1').text());

      // remove the title element since we already have it now
      $ource('body h1').remove();
      // strip out any 'empty' tags
      $ource('body *').each(function(){
        var $t = $ource(this);
        if($t.text().replace(/\s+/gi, '') == ''){
          $t.remove();
        }
      });
      var content = sani($ource('body').html(), saniOpts).trim();

      // generate excerpt
      var contentWords = sani($ource('body p').html(), {allowedTags: [] }).split(' ');

      var excerpt = contentWords.reduce(function(excerpt, word, index, list){
        var test = list.slice(0, index).join(' ');
        if(test.length<80){
          return test;
        }
        return excerpt;
      }, '');

      var out = {
        title: title,
        excerpt: excerpt,
        content: content
      }

      var combinedTemplate = '<div><div class="help-topic excerpt"><h4><a class="titleTarget" href="#"></a></h4><p class="excerptTarget"></p></div><h4 class="titleTarget"></h4><div class="contentTarget"></div></div>';

      var $target = cheerio.load(combinedTemplate);
      $target('.titleTarget').each(function(){
        var $t = $target(this);
        $t.html(out.title);
      });
      $target('.excerptTarget').each(function(){
        var $t = $target(this);
        $t.html(out.excerpt);
      });
      $target('.contentTarget').each(function(){
        var $t = $target(this);
        $t.html(out.content);
      });

      var outHTML = $target.html();

      cb(null, out, outHTML);

    }
  });
}
