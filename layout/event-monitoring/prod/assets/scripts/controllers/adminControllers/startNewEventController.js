var startNewEventController=angular.module("startNewEventController",[]);startNewEventController.controller("StartNewEventController",["$rootScope","$scope","$http","$state","RequestData","filterHashtags","User",function($rootScope,$scope,$http,$state,RequestData,filterHashtags,User){$scope.showSearchInput=!1,$scope.loading=!1,$scope.showSearchInput=function(){$scope.showSearchInput=!$scope.showSearchInput};$scope.newKeywordAdded=function(keyword){keyword=keyword.text,$rootScope.keywords.push(keyword)},$scope.keywordRemoved=function(keyword){keyword=keyword.text;var index=$rootScope.keywords.indexOf(keyword);-1!==index&&$rootScope.keywords.splice(index,1)},$scope.twitterLogIn=function(){User.getTwitterAuth(!0)},$scope.startNewEvent=function(){var hashtags=$scope.eventHashtag;hashtags.forEach(function(hashtag,i){var eventHashtag=hashtag.text;$scope.validHashtag=filterHashtags.preventBadHashtags(eventHashtag)}),$scope.validHashtag||($scope.$broadcast(),RequestData.startEvent($rootScope.keywords).success(function(response){$scope.loading=!0,$rootScope.eventID=response.uuid,$state.transitionTo("admin",{uuid:$scope.eventID})}))}}]);