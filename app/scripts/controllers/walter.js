'use strict';

angular.module('hackApp')
  .controller('WalterCtrl', function ($scope, $rootScope, Talk) {
    //Have we started:
    var started = false;

    //Kick off walter:
    $scope.walter = function(){
      if (!started){
        started = true;
        Talk.greet('Andy').then(function(){
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
        });
      }else{
        started = false;
        Talk.stop();
      }
    };
  });
