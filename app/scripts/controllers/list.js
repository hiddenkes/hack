'use strict';

angular.module('hackApp')
  .controller('ListCtrl', function ($scope, $http, $routeParams, $rootScope, $timeout) {
    $scope.news = [];
    $scope.interest = $routeParams.interest || 'Bugs';
    $rootScope.interest = $scope.interest;
    $timeout(function() {
      $http.get('/api/story/' + $scope.interest).success(function(data){
        $scope.news = data.articles;
        $rootScope.articles = data.articles;
      });
    }, 800);

  });
