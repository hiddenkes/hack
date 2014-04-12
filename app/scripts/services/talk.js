'use strict';

angular.module('hackApp')
  .service('Talk', function Talk($q) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.rate = 1;
    this.lang = 'en-US';

    this.talk = function(text){
      var def = $q.defer();

      var u = new SpeechSynthesisUtterance();
      u.text = text;
      u.rate = this.rate;
      u.lang = this.lang;

      u.onend = function(event) { def.resolve(event); }

      speechSynthesis.speak();

      return def.promise;
    };
  });
