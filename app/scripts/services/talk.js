'use strict';

angular.module('hackApp')
  .service('Talk', function Talk($q, $compile, $timeout) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.rate = 1;
    this.lang = 'en-US';
    this.pitch = 1;

    var greetings = [
      'Hello, <%= name %>!',
      'Welcome, <%= name %>!',
      'How is your day going, <%= name %>?',
      'Good evening, <%= name %>.',
      'How are you doing, <%= name %>?',
    ];

    var arr = [];
    var processing = false;

    this.queue = function(text){
      arr.push(text);
      if(!processing){
        processing = true;
        var self = this;
        $timeout(function(){
          self.process();
        }, 100);
      }
    };

    this.process = function(){
      var self = this;
      $timeout(function(){
        self.talk(arr.shift()).then(function(){
          console.log('done');
          $timeout(function(){
            if(arr.length > 0){
              self.process();
            }else{
              processing = false;
            }
          }, 100);
        });
      }, 200);
    }

    this.talk = function(text){
      var def = $q.defer();

      var u = new SpeechSynthesisUtterance(text);
      u.rate = this.rate;
      u.lang = this.lang;
      u.pitch = this.pitch;
      u.onend = function(event) { $timeout(function(){
        def.resolve();
      }, 100); }
      var voices = speechSynthesis.getVoices();

      $timeout(function(){
        var voice = null;
        //Weirg bug where first time returns no results:
        var voices = speechSynthesis.getVoices();
        var voice = voices[0];
        for(var i = 0; i < voices.length; i++){
          var v = voices[i];
          if(v.name.toLowerCase().indexOf('male') >= 0){
            voice = v;;
          }else if(v.name === 'Daniel'){
            voice = v;
          }
        }

        u.voice = voice;
        speechSynthesis.speak(u);
      }, 100);

      return def.promise;
    };

    this.stop = function(){
      arr = [];
      return speechSynthesis.cancel();
    };

    this.greet = function(name){
      var compiled = _.template(greetings[_.random(greetings.length-1)])
      var speech = compiled({name: name});
      return this.talk(speech);
    };

    this.end = function(){
      return this.talk('And that\'s the way it is.');
    };
  });
