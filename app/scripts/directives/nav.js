'use strict';

angular.module('hackApp')
  .directive('nav', function ($rootScope, $timeout, $location) {
    return {
      templateUrl: 'partials/nav',
      restrict: 'AE',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.expanded = false;

        var timeout = false;

        scope.show = function($event){
          $($event.target).parent().addClass('active-new');
          scope.expanded = false;
          $rootScope.$broadcast('nav-expand', {expanded: scope.expanded});
          $timeout(function(){
            $($event.target).parent().removeClass('active-new');
            $location.path('/list/test');
          }, 500);
        };

        scope.addInterest = function(){
          //TODO:
        };

        scope.expand = function(op){
          if(timeout){
            $timeout.cancel(timeout);
          }

          if(!op){
            timeout = $timeout(function(){
              scope.expanded = op;
              $rootScope.$broadcast('nav-expand', {expanded: scope.expanded});
            }, 600);
          }else{
            scope.expanded = op;
            $rootScope.$broadcast('nav-expand', {expanded: scope.expanded});
          }
        };

        var $body = $(element).find('.sm').first();
        var scrolling = false, direction;
        var scale = 0;
        scope.noScroll = function(){
          scrolling = false;
          direction = false;
          scroll();
        };

        scope.scrollDown = function($event){
          var offset = $event.offsetY;
          scale = 1 + Math.round(offset/75 * 1);

          scrolling = true;
          direction = 'down';
          scroll();
        };
        scope.scrollUp = function($event){
          var offset = $event.offsetY;
          scale = 1 + Math.round(75/offset * 1);
          scrolling = true;
          direction = 'up';
          scroll();
        };

        var scroll = function(){
          if(scrolling === true){
            var inc = direction === 'up' ? -1 * scale : scale;
            var ntop = $body.scrollTop() + inc;
            $body.scrollTop(ntop);
            $timeout(scroll, 20);
          }
        }
      }
    };
  });
