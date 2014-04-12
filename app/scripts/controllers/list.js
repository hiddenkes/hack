'use strict';

angular.module('hackApp')
  .controller('ListCtrl', function ($scope, $http, $routeParams, $timeout) {
    $scope.news = [];
    $scope.interest = $routeParams.interest || 'Bugs';
    $timeout(function() {

      $http.get('http://api.feedzilla.com/v1/articles/search.json?count=100&q=' + $scope.interest).success(function(data){
        $scope.news = data.articles;
      });
    }, 800);

    var $body = $(document.body);
    var scrolling = false, direction;
    var scale = 0;

    $scope.noScroll = function(){
      scrolling = false;
      direction = false;
      scroll();
    };

    $scope.scrollDown = function($event){
      var offset = $event.offsetY;
      scale = 1 + Math.round(offset/75 * 2);

      scrolling = true;
      direction = 'down';
      scroll();
    };
    $scope.scrollUp = function($event){
      var offset = $event.offsetY;
      scale = 1 + Math.round(75/offset * 2);
      scrolling = true;
      direction = 'up';
      scroll();
    };

    var scroll = function(){
      if(scrolling === true){
        var inc = direction === 'up' ? -1 * scale : scale;
        var ntop = $body.scrollTop() + inc;
        $body.scrollTop(ntop);
        $timeout(scroll, 15);
      }
    }

  });
