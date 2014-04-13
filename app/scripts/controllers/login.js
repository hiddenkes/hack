'use strict';

angular.module('hackApp')
  .controller('LoginCtrl', [ '$scope', '$http', '$firebase', '$firebaseSimpleLogin', '$location', function ($scope, $http, $firebase, $firebaseSimpleLogin, $location) {

    $scope.loginForm = {};

    $scope.registerFail = false;

    var dataRef = new Firebase("https://walterhackil.firebaseio.com");

	  $scope.auth = $firebaseSimpleLogin(dataRef);

    $scope.login = function() {
      $scope.auth.$login('password', {
         email: $scope.loginForm.email,
         password: $scope.loginForm.password,
      }).then(function(user) {
         console.log('Logged in as: ', user.uid);
      }, function(error) {
         console.error('Login failed: ', error);
      });

      $location.path( "/" );
    }

    $scope.register = function() {
      $scope.auth.$createUser($scope.loginForm.email, $scope.loginForm.password).then(function() {
        $location.path( "/" );
      }, function() {
        $scope.registerFail = true;
      });

    }

  }]);
