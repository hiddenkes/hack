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

        scope.interests = ['Sports', 'Science', 'Dogecoin', 'Politics', 'Technology', 'Business'];
        scope.interests.sort();

        scope.show = function(url, $event){
          $($event.target).parent().addClass('active-new');
          scope.expanded = false;
          $rootScope.$broadcast('nav-expand', {expanded: scope.expanded});
          $timeout(function(){
            if(url === '/') return;
            $location.path('/list/' + url);
          }, 500);
        };

        scope.addInterest = function(){
          if(scope.inputModel && scope.inputModel.trim().length >= 2){
            scope.interests.push(scope.inputModel);
            scope.interests.sort();
            scope.inputModel = '';
            //TODO: firebase
          }
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

        scope.topScroll = 0;
        $body.scroll(function(){
          console.log(scope.topScroll);
          scope.topScroll = $body.scrollTop();
        });

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
