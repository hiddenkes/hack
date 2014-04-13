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

        scope.fulltextNoP = angular.copy(scope.fulltext);

        scope.fulltext = '<p>' + scope.fulltext.split('\n').join('</p><p>') + '</p>';

        scope.talk = function(){
          Talk.queue(scope.title);
          if(scope.full){
            Talk.queue(scope.fulltextNoP);
            Talk.queue('And that\'s the way it is.');
          }else{
            _.each(scope.summary, function(sum){
              Talk.queue(sum);
            });
            Talk.queue('And that\'s the way it is.');
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
