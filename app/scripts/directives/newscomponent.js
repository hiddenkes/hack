'use strict';

angular.module('hackApp')
  .directive('newsComponent', function ($timeout, Talk) {
    return {
      templateUrl: 'partials/newscomponent',
      restrict: 'AE',
      scope: {
    	  title: "=ntitle",
    	  summary: "=",
    	  fulltext: "=full",
    	  image: "="
      },
      link: function(scope, element, attrs) {
        scope.expanded = false;
        scope.full = false;

        scope.fulltext = '<p>' + scope.fulltext.split('\n').join('</p><p>') + '</p>';

        scope.talk = function(){
          Talk.queue(scope.title);
          if(scope.full){
            Talk.queue(scope.fulltext);
          }else{
            _.each(scope.summary, function(sum){
              Talk.queue(sum);
            });
          }
        };

    	  scope.expand = function() {
    		  scope.expanded = !scope.expanded;
    	  };

        scope.gofull = function() {
          scope.full = !scope.full;
        };
      }
    };
  });
