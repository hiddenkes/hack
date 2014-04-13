
function clean(tokens, string) {
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].toLowerCase() == string) {
      tokens.splice(i, 1);
      i--;
    }
  }

  return tokens;
}


function tokenizeSentence(sentence, callback) {
  sentence = sentence.replace(/[,.]+/g, '');
  var tokens = sentence.split(' ');

  tokens = clean(tokens, "");
  callback(tokens);
}

function splitParagraphs(content, callback) {
	callback(content.split('\n'));
}

function findChar( c, str, idx ) {
    var count = idx;
    for( var i = 0; i < str.length; i++ ) {
        if( str.charAt(i) === c )
            count--;

        if(count === 0)
            return i;
    }
    return -1;
}

function splitSentences(paragraph, callback) {
  var sentences = paragraph.split('.');
  sentences.forEach(function(sent, i) {
    if(sent.charAt(0) === ' ') {
      sentences[i] = sent.substr(1);
    }

    var commas = sent.split(",").length - 1;

    /*if(commas % 2 === 1) {
      sentences[i] = sent.substr(sent.indexOf(',')+1);
    }*/

    /*if(commas % 2 === 0 && commas > 0 ) {
      sentences[i] = sent.slice(0, sent.indexOf(',')) + sent.substring(findChar(',', sent, 2));
    }*/

  });
  callback(sentences);
}

function removeCommon(sentence, callback) {

  var common = ['the','of','to','and','a','in','is','it','you',
                'that','he','was','for','on','are','with','as','I','his',
                'they','be','at','one','have','this','from','or','had',
                'by','hot','but','some','what','there','we','can',
                'out','other','were','all','your','when','up','use','word',
                'how','said','an','each','she','which','do','their','time',
                'if','will','way','about','many','then','them','would','write',
                'like','so','these','her', 'into', 'say' ];

  common.forEach(function(word) {
    sentence = clean(sentence, word);
  });

  callback(sentence);
}

function getKeyWords(sentenceTokens, callback) {

  var words = [];
  var freqs = [];
  var bestf = [ 0, 0, 0];
  var besti = [-1, -1, -1];
  var found = false;

  for( var i = 0; i < sentenceTokens.length; i++ ) {
    for( var j = 0; j < sentenceTokens[i].length; j++ ) {
      found = false;
      for( var k = 0; k < words.length; k++ ) {
        if(sentenceTokens[i][j] === words[k]) {
          freqs[k]++;
          found = true;
        }
      }
      if( found === false ) {
        words.push(sentenceTokens[i][j]);
        freqs.push(1);
      }
    }
  }

  for( i = 0; i < words.length; i++ ) {
    j = 2;
    while( freqs[i] > bestf[j] && j != 0)
      j--;

    if(freqs[i] < bestf[j])
      j++;

    if( j <= 2 ) {
      bestf.splice(j, 0, freqs[i]);
      bestf.pop();
      besti.splice(j, 0, i);
      besti.pop();
    }
  }

  var keywords = [];
  for( i = 0; i < 3; i++ ) {
    var key =  {
      'word': words[besti[i]],
      'score': (bestf[i]/bestf[0]) * 1.5
    }
    keywords.push(key);
  }

  callback(keywords);
}

function getSentences(content, callback) {

  var sentences = [];
  var sentenceTokens = [];
  var sentsPosition = [];
  var sentsCounts = 0;

  splitParagraphs(content, function(paragraphs) {
    paragraphs.forEach(function(para) {
      splitSentences(para, function(sentence) {
        sentence.forEach(function(sent, i) {
          if( i === 0 ) {
            sentsPosition[sentsCounts] = 0.05;
          }
          else {
            sentsPosition[sentsCounts] = 0;
          }
          sentsCounts++;

          if( sent !== "") {
            sentences.push(sent);
          }
        });
      });
    });

    sentences.forEach(function(sent) {
      tokenizeSentence(sent, function(tokens) {
        sentenceTokens.push(tokens);
      });
    });

    callback( sentences, sentenceTokens, sentsPosition );
  });
}

function formatContent( content, callback ) {
  getSentences( content, function(sentences, sentenceTokens, sentencePosition ) {
    sentenceTokens.forEach(function(sentence) {
      removeCommon(sentence, function(sents) {
        sentence = sents;
      });
    });

    var keywords;
    getKeyWords(sentenceTokens, function(key) {
      keywords = key;
    });

    callback(sentences, sentenceTokens, keywords, sentencePosition );
  });
}

function findKeys( word, keywords ) {
  for( var i = 0; i < keywords.length; i++ ) {
    if( word.toLowerCase() === keywords[i].word )
      return keywords[i].weight;
  }
  return 0;
}

function mergeKeys( main, add ) {
  var found = false;
  for( var i = 0; i < add.length; i++ ) {
    found = false;
    for( var j = 0; j < main.length; j++ ) {
      if( add[i].word === main[j].word ) {
        main[j].weight = 1.5;
        found = true;
      }
    }
    if( found !== true ) {
      main.push(add[i]);
    }
  }

  return main;
}

function compareSentences( sentenceTokens, sentencePosition, keywords, callback ) {
  var sentenceGraph = [];

  for( var i = 0; i < sentenceTokens.length; i++ ) {
    sentenceGraph.push([]);
    for( var j = 0; j < sentenceTokens.length; j++ ) {
      if( j !== i ) {
        var wordsCount = 0;
        for(var k = 0; k < sentenceTokens[i].length; k++ ) {

          wordsCount += findKeys( sentenceTokens[i][k], keywords );

          for( var l = 0; l < sentenceTokens[j].length; l++ ) {
            if( sentenceTokens[i][k] === sentenceTokens[j][l] ) {
              wordsCount++;
            }
          }
        }

        sentenceGraph[i][j] = wordsCount/((sentenceTokens[i].length + sentenceTokens[j].length)/2);
      }
      else {
        sentenceGraph[i][j] = 0;
      }
    }
  }

  var sentenceScore = [];
  for( i = 0; i < sentenceTokens.length; i++ ) {
    sentenceScore[i] = 0;
    for( j = 0; j < sentenceTokens.length; j++ ) {
      sentenceScore[i] += sentenceGraph[i][j] + sentencePosition[i];
    }
  }

  callback(sentenceScore);
}

function summarize(title, keywords, content, numSentences, callback) {

  var cleanTitle = [];

  tokenizeSentence(title, function(toks) {
    removeCommon(toks, function(ctoks) {

      for( var i = 0; i < ctoks.length; i++ ) {
        cleanTitle.push({'word': ctoks[i], 'weight': 1});
      }

      keywords = mergeKeys(keywords, cleanTitle);
    });
  });

  var bestSents = [numSentences];
  var bestIdx   = [];

  for( var i = 0; i < numSentences; i++ ) {
    bestSents[i] = 0;
    bestIdx[i] = -1;
  }

  formatContent(content, function(sents, sentsToks, keys, sentsPos) {
    keywords = mergeKeys(keywords, keys);
    compareSentences(sentsToks, sentsPos, keywords, function(sentsScore) {
      for( i = 0; i < sentsScore.length; i++ ) {
        var j = 1;
        if( sentsScore[i] > bestSents[numSentences - j] ) {
          while(sentsScore[i] > bestSents[numSentences - j] && j != numSentences ) {
            j++;
          }
          if( sentsScore[i] < bestSents[numSentences - j])
            j--;

          bestSents.splice(numSentences - j, 0, sentsScore[i]);
          bestIdx.splice(numSentences - j, 0, i);

          bestSents.pop();
          bestIdx.pop();
        }
      }

      var rankSents = [];
      for( i = 0; i < numSentences; i++ ) {
        rankSents.push(sents[bestIdx[i]]);
      }

      callback(rankSents, keywords);
    });
  });
}

module.exports = summarize;

//Stuff
