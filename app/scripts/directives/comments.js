'use strict';

angular.module('hackApp')
  .directive('comments', function ($rootScope, $timeout, $location) {
    return {
      templateUrl: 'partials/comments',
      restrict: 'AE',
	  scope: {
		  articleid: '='
	  },
      link: function(scope, element, attrs) {

      },
	  controller: function($scope, $firebase, $rootScope) {
      var comRef, commentRef;
      $scope.$watch('articleid', function(){
        if($scope.articleid){
          comRef = new Firebase('https://walterhackil.firebaseio.com/comments');
          commentRef = comRef.child($scope.articleid);
          $scope.comments = $firebase(commentRef);
          $scope.number = 0;

          $scope.predicate = 'timestamp';
        }
      });

			$scope.addComment = function($event) {
				if ($event.keyCode === 13 || $event.which === 13) {
  				var username = ($rootScope.user || {}).username || 'Guest';
  				var date = (new Date()).getTime();

  				var cm = {
  					username: username,
  					comment: $scope.commentText,
  					dt: 'a' + date
  				};

  				commentRef.push(cm);
          $scope.commentText = '';
				}
			}
	  }
    };
  });
