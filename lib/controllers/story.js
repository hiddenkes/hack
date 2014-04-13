'use strict';

var summary = require('node-summary');
var request = require('request');
var _ = require('underscore');
var cheerio = require('cheerio');
var async = require('async');

// Compact arrays with null entries; delete keys from objects with null value
function removeNulls(obj){
  var isArray = obj instanceof Array;
  for (var k in obj){
    if (obj[k]===null) isArray ? obj.splice(k,1) : delete obj[k];
    else if (typeof obj[k]=="object") removeNulls(obj[k]);
  }
}

var summarize = require('./summarize');

_.str = require('underscore.string');
_.mixin(_.str.exports());

var Firebase = require('firebase');
var myRootRef = new Firebase('https://nlp-cache.firebaseIO.com/');

function countSentences(input) {
  var count = 0;
  count += _(input).count('.');
  count += _(input).count('!');
  count += _(input).count('?');
  count += _(input).count(':');
  return count;
}

function calculateWPRatio(text) {
  var sent_count = countSentences(text),
    word_count = countWords(text),
    punc_count = countPunctuation(text);
  return (word_count/((2*sent_count)/punc_count));
}

function percentageLetter(input) {
  var chars = _.chars(input),
    total = chars.length,
    letters = 0;
  _.each(chars, function(e) {
    var objRegExp  = /^[a-z]+$/;
    if (objRegExp.test(e)) {
      letters += 1;
    }
  });
  return (letters / total);
}

function countPunctuation(input) {
  var count = 0;
  count += 2* _(input).count('.');
  count += 2* _(input).count(',');
  count += 4* _(input).count(':');
  count += _(input).count('!');
  count += _(input).count('?');
  return count;
}

function countWords(input) {
  if (input) {
    input = input.replace(/(^\s*)|(\s*$)/gi,"");
    input = input.replace(/[ ]{2,}/gi," ");
    input = input.replace(/\n /,"\n");
    return input.split(' ').length;
  }
  return null;
}

exports.list = function(req, res) {

  var interest = req.params.interest || 'Bugs';
  var interestRef = myRootRef.child(interest.toLowerCase());
  var ccb = function(snapshot) {
    interestRef.off('value', ccb)
    var val = snapshot.val();
    var lastDate = (new Date()).getTime() - 18000000;
    if(val === null || !val.cache || val.cached > lastDate) {

      var assoc = (val || {}).assoc || [];
      console.log('initial request');
      request('http://api.feedzilla.com/v1/articles/search.json?count=30&q=' + interest, function(error, response, body){
        if (!error && response.statusCode == 200) {
          var info = JSON.parse(body || '');

          var todo = [];
          _.each(info.articles, function(article){
            var p = {ok: false, title: '', url: '', fulltext: '', image: '', summary: []};
            var t = ((article || {}).title || '');
            p.title = (t.substring(0, t.lastIndexOf(' ('))) || '';

            todo.push({assoc: assoc, ref: interestRef, p: p, __url: article.url, url: article.url.substring(0, article.url.indexOf('?'))});
          });
          console.log('mapping...');
          async.mapLimit(todo, 2, doreq, function(err, results){
            res.json({ok: true, articles: results});
            try {
              interestRef.update({'cache': removeNulls(results), 'cached': (new Date()).getTime()});
            }catch(e){}
          });
        }else{
          res.json({ok: false});
        }
      });
    } else {
      var val = snapshot.val();
      res.json({ok: true, articles: val.cache});
    }
  };
  interestRef.on('value', ccb);
};


function doreq(obj, crb){
  var uri = obj.url;
  var p = obj.p;
  request(uri, function(error, response, body){
    //console.log(body);
    var ch = cheerio.load(body || '');
    var url = ch('iframe').attr('src') || false;
    if(url){
      //Use IP to avoid DNS issues on expiring domains:
      //url.replace('news.feedzilla.com', '109.123.81.101');
      //console.log(url);
      request(url, function(error, resp, article){
        console.log(article);
        var $ = cheerio.load(article || '');

        //Find the image:
        var image = false;
        image = $('meta[property="og:image"]').attr("content");
        if(!image){
          image = $('img[data-fragment="lead-image"]').attr('src');
        }if(!image){
          image = $('article .picture img').attr('src');
        }if(!image){
          image = $('article img').attr('src');
        }if(!image){
          image = $('.post-body img').attr('src');
        }if(!image){
          image = $('p').closest('img').attr('src');
        }if(!image){
          image = $('img').attr('src');
        }if(!image){
          image = '';
        }

        p.image = image || '';
        p.url = url || '';

        var paragraphs = [],
          sentences = [],
          sentencesIndex = [],
          dict = [],
          selSentences = [],
          selSentencesWords = 0,
          ignore = [],
          dict_p_arr = [],
          dict_p_arr_balance = [],
          strip_s = "",
          i = 0,
          totalWords = 0;

        var cand = $('p').toArray();
        _.each(cand, function(ele) {
          if ($(ele).find('div').length === 0 && $(ele).find('img').length === 0 && $(ele).find('script').length === 0 && $(ele).find('ul').length === 0) {

            var text = _($(ele).text()).stripTags().trim(),
              sent_count = countSentences(text),
              wp_ratio = calculateWPRatio(text);
              totalWords += countWords(text);

            if (percentageLetter(text) > 0.5 && sent_count > 0 && wp_ratio > 60) {
              paragraphs.push(text);
            }
          }
        });
        p.fulltext = (paragraphs || []).join('\n') || '';

        summarize(p.title, [], p.fulltext, 4, function(sorted, keys) {

          _.each(keys, function(k){
            k.word = k.word || '';
            k.weight = k.weight || 1;
          });

          //obj.ref.update({'assoc': _.compact(keys)});

          p.summary = sorted || [];
          /*
          summary.getSortedSentences(p.fulltext || '', 4, function(err, sorted_sentences) {
            if(err) {
              //console.log("There was an error."); // Need better error reporting
            }else{
              p.old_summary = sorted_sentences || [];
            }
            */
            p.ok = true;
            crb(null, p);
          //});
        });
      });
    }else{
      crb(null, p);
    }
  });
}
