'use strict';

angular.module('hackApp')
  .directive('newsComponent', function () {
    return {
      templateUrl: 'partials/newscomponent',
      restrict: 'AE',
      scope: {
    	  title: "=",
    	  short: "=",
    	  paragraph: "=",
    	  full: "=",
    	  image: "="
      },
      link: function(scope, element) {
        scope.expanded = false;

    	  scope.expand = function() {
    		  scope.expanded = !scope.expanded;
    	  }
      }
    };
  });
