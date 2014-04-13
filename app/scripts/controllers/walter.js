'use strict';

angular.module('hackApp')
  .controller('WalterCtrl', function ($scope, $rootScope, Talk) {
    //Have we started:
    var started = false;

    var greeted = false;

    //Kick off walter:
    $scope.walter = function(){
      if (!started){
        started = true;

        if(!greeted){
          greeted = true;
          Talk.greet('Andy');
        }

        if(!$rootScope.interest){
          Talk.queue('Move your mouse to the left of the page to select your interests.');
          started = false;
          return;
        }else if(typeof $rootScope.articles !== "object"){
          Talk.queue('Please wait while your stories are loaded. This may take up to a minute.');
          started = false;
          return;
        }else if($rootScope.articles.length == 0){
          Talk.queue('No articles could be found about your listed interests. Please try later, or enter a different interest.');
          started = false;
          return;
        }

        Talk.queue('Here is your summary for ' + $rootScope.interest + '.');
        _.each($rootScope.articles, function(article, i){
          if(i === 0){
            Talk.queue('First Up: ');
          }else{
            Talk.queue('Next: ');
          }

          Talk.queue(article.title);

          _.each(article.summary, function(sum){
            Talk.queue(sum);
          });
        });
      }else{
        Talk.stop();
        started = false;
      }
    };
  });
