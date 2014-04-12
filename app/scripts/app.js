'use strict';

angular.module('hackApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/watch', {
        templateUrl: 'partials/watch',
        controller: 'WatchCtrl'
      })
      .when('/list/:interest?', {
        templateUrl: 'partials/list',
        controller: 'ListCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
