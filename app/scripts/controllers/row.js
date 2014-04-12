'use strict';

angular.module('hackApp')
  .controller('RowCtrl', function ($scope, $http) {
    $scope.full = true;

    $scope.$on('nav-expand', function(event, options){
      $scope.full = !options.expanded;
    });
  });
