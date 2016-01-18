var eventApp = angular.module('eventApp', []);

// Controller : Populate the recieved data and update admin page
eventApp.controller('EventMainController', ['$rootScope', '$scope', '$http', '$location', '$window', '$anchorScroll', '$state', '$timeout', 'RequestData', 'RequestViewsLayoutData', 'CreateEventSource',
                                            function ($rootScope, $scope, $http, $location, $window, $anchorScroll, $state, $timeout, RequestData, RequestViewsLayoutData, CreateEventSource) {

        $rootScope.eventID = $location.search().uuid;
        $scope.eventID = $location.search().uuid;

        $rootScope.getViewOptions = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/config';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $rootScope.userColor = response.backgroundColor;
                    $rootScope.userSize = response.size;
                    $scope.showRetweets = response.retweetEnabled;
                    $scope.enableModeration = response.moderated;

                }).error(function () {
                    console.log("#");
                })
        }
        $rootScope.getViewOptions();

        $scope.moderationStatus = function () {

            if ($scope.enableModeration == false) {
                var requestAction = "DELETE";
            } else {
                var requestAction = "PUT";
            }

            var apiUrl = '/api/events/' + $rootScope.eventID + '/moderation';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {}).error(function () {
                    console.log("#");
                })
        };

        $scope.retweetsStatus = function () {
            if ($scope.showRetweets == false) {
                var requestAction = "DELETE";
            } else {
                var requestAction = "PUT";
            }

            var apiUrl = '/api/events/' + $rootScope.eventID + '/retweets';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {}).error(function () {
                    console.log("#");
                })
        };

        $rootScope.getEventStats = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/basicStats';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.numberOfUsers = response.numberOfUsers;
                    $rootScope.totalTweetsFromServer = response.totalTweets;
                    $scope.totalRetweets = response.totalRetweets;
                    $scope.startTime = response.startTime;
                    var myDate = new Date($scope.startTime);
                    $scope.startTimeMilliseconds = myDate.getTime();
                }).error(function () {
                    console.log("#");
                })
        }
        $rootScope.getEventStats();

        $scope.$watch('layoutScreens|filter:{selected:true}', function (nv, ov, scope) {

            $rootScope.userScreens = [];
            angular.forEach(nv, function (value, key) {
                if (value.selected == true) {
                    this.push(value.value);
                }
            }, $rootScope.userScreens);
        }, true);


        $scope.goLive = function () {
            $window.open($rootScope.baseUrl + "/event-monitoring/views/presentation/#/live?uuid=" + $rootScope.eventID, '_blank');
        }

        // Layout : Color
        $rootScope.userColor = RequestViewsLayoutData.userColor();
        // Layout : Size
        $rootScope.userSize = RequestViewsLayoutData.userSize();

        // Start New Event Handler
        $scope.eventStarted = false;
        $rootScope.timerRunning = false;
        $scope.tweetsQueue = [];
        $scope.tweet = {};
        $scope.tweetsCount = 0;


        // Listen to new message
        $scope.startEventSource = function () {
            $scope.eventSourceUrl = $rootScope.baseUrl + "/api/events/" + $rootScope.eventID + "/adminEventSource";

            var source = new EventSource($scope.eventSourceUrl);

            source.addEventListener('tweet', function (response) {

                $scope.tweet = JSON.parse(response.data);


                $scope.$apply(function () {
                    $scope.tweetsQueue.push($scope.tweet);
                    $scope.tweetsCount = $rootScope.totalTweetsFromServer + $scope.tweetsQueue.length;
                }, false);
            });


            source.addEventListener('new-admin-opened', function (response) {
                console.log(response);
                source.close();
            });
        }

        $scope.startEventSource();

        $scope.pagesShown = 1;
        $scope.pageSize = 20;

        // Tweet queue limit
        $scope.tweetsQueueLimit = function () {
            return $scope.pageSize * $scope.pagesShown;
        };

        // Show load more button
        $scope.loadMoreButton = function () {
            return $scope.pagesShown < ($scope.tweetsCount / $scope.pageSize);
        }

        // Load more tweets handler
        $scope.loadMoreTweets = function () {
            $scope.pagesShown = $scope.pagesShown + 1;
            $location.hash('toApproveDiv');
            $anchorScroll();
        };

        // Remove Tweet From List
        $scope.removedTweetsCount = 0;

        $scope.removeTweet = function (e, $index) {

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            var tweetIndex = $(e.currentTarget).attr('data-id');

            var eventID = $rootScope.eventID;
            var requestAction = "POST";
            var apiUrl = '/api/events/' + eventID + '/blockedTweets/' + tweetId;
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.tweetsQueue.splice(tweetIndex, 1);
                    $scope.removedTweetsCount++;
                }).error(function () {
                    console.log("#");
                })
        }

        // Approve Tweet
        $scope.approvedTweetsCount = 0;

        $scope.approveTweet = function (e, $index) {

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            var tweetIndex = $(e.currentTarget).attr('data-id');

            var eventID = $rootScope.eventID;
            var requestAction = "POST";
            var apiUrl = '/api/events/' + eventID + '/approvedTweets/' + tweetId;
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.tweetsQueue.splice(tweetIndex, 1);
                    $scope.approvedTweetsCount++;
                }).error(function () {
                    console.log("#");
                })
        }


        // Approve Tweet As Starred
        $scope.approveStarred = function (e, $index) {

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            var tweetIndex = $(e.currentTarget).attr('data-id');

            var eventID = $rootScope.eventID;
            var requestAction = "POST";
            var apiUrl = '/api/events/' + eventID + '/approvedTweets/' + tweetId + "?starred=true";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.tweetsQueue.splice(tweetIndex, 1);
                    $scope.approvedTweetsCount++;
                }).error(function () {
                    console.log("#");
                })
        }

        // Approve all tweets
        $scope.approveAllTweets = function () {

            var eventID = $rootScope.eventID;
            var requestAction = "POST";
            var apiUrl = '/api/events/' + eventID + '/approvedTweets/all';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.tweetsQueue = [];
                }).error(function () {
                    console.log("#");
                })
        }

        // Update Config
        $scope.updateViewOptions = function (userColor, userSize, userScreen) {

            var eventID = $rootScope.eventID;
            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/config';

            var userColor = RequestViewsLayoutData.userColor();
            var userSize = RequestViewsLayoutData.userSize();
            var userScreen = RequestViewsLayoutData.userScreen();

            var requestData = {
                "backgroundColor": userColor,
                "screens": userScreen,
                "screenTimes": [70000, 50000, 30000],
                "size": userSize

            };
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    console.log("Options Updated");
                })
        }

        $scope.updateBlockedUsers = function (e, screenName, userPicture, userID) {

            var requestAction = "PUT";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/blockedUsers/' + screenName;
            var requestData = "";

            // create the notification
            var notification = new NotificationFx({
                message: '<div class="ns-thumb"><img src="' + userPicture + '"/></div><div class="ns-content"><p><a href="#">"' + screenName + '</a> haven been added to blocked users list.</p></div>',
                layout: 'other',
                ttl: 3000,
                effect: 'thumbslider',
                type: 'error'
            });

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    // show the notification
                    notification.show();

                    var tweetQueueWithoutBlocked = [];
                    angular.forEach($scope.tweetsQueue, function (tweet) {
                        if (tweet.user.id_str != userID) {
                            tweetQueueWithoutBlocked.push(tweet);
                        }
                    });
                    $scope.tweetsQueue = tweetQueueWithoutBlocked;
                })

        }

        $scope.updateTrustedUsers = function (e, screenName, userPicture, userID) {

            var requestAction = "PUT";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/trustedUsers/' + screenName;
            var requestData = "";

            // create the notification
            var notification = new NotificationFx({
                message: '<div class="ns-thumb"><img src="' + userPicture + '"/></div><div class="ns-content"><p><a href="#">"' + screenName + '</a> haven been added to trusted users list.</p></div>',
                layout: 'other',
                ttl: 3000,
                effect: 'thumbslider',
                type: 'success'
            });

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    // show the notification
                    notification.show();

                    $scope.tweetQueueWithoutTrusted = [];

                    angular.forEach($scope.tweetsQueue, function (tweet) {
                        if (tweet.user.id_str != userID) {
                            $scope.tweetQueueWithoutTrusted.push(tweet);
                        }
                    });

                    $scope.tweetsQueue = $scope.tweetQueueWithoutTrusted;
                })

        }

        // Stop Event Handler
        $scope.stopEventHandler = function () {

            // create the notification
            var notification = new NotificationFx({
                message: '<p>Hello there! Your event have been stoped.</p>',
                layout: 'growl',
                ttl: 3000,
                effect: 'genie',
                type: 'notice'
            });
            
            $scope.eventStarted = false;
            $scope.$broadcast('timer-stop');
            $rootScope.timerRunning = false;

            // show the notification
            notification.show();
            $state.transitionTo('home');
            // var eventID = $rootScope.eventID;
            // var requestAction = "DELETE";
            // var apiUrl = '/api/events/' + eventID;
            // var requestData = "";
            // RequestData.fetchData(requestAction, apiUrl, requestData).then(function (response) {})
        }
}]);
