'use strict';

angular.module('hackApp')
  .controller('MainCtrl', function ($scope, $location, $timeout, $rootScope) {
    $scope.start = true;
    $scope.activ = function($event){
      $scope.start = false;
      $timeout(function(){
        $($event.target).parent().find('input').focus();
      }, 150);
    }
    $scope.go = function(){
      $rootScope.user = {
        username: 'Guest',
        name: $scope.name
      }
      $location.path('/list/Dogecoin');
    };
  });
