var eventApp = angular.module('eventApp', []);

// Controller : Populate the recieved data and update admin page
eventApp.controller('EventMainController', ['$rootScope', '$scope', '$http', '$location', '$window', ' $anchorScroll', '$state', 'RequestData', 'RequestViewsLayoutData',
                                            function ($rootScope, $scope, $http, $location, $window, $anchorScroll, $state, RequestData, RequestViewsLayoutData) {
        //        console.log($state);

        //        if ($state.current.url == "/admin?uuid") {
        //            $scope.$on('$locationChangeStart', function (event) {
        //                var answer = confirm("Are you sure you want to leave this page?");
        //                console.log(answer);
        //                if (answer) {
        //                    console.log(answer);
        //                    $scope.stopEventHandler();
        //                    // Redirect the front website page to the admin page
        ////                    $state.transitionTo('admin');
        //                } else {
        ////                    event.preventDefault();
        //                    console.log(answer);
        //                }
        //            });
        //
        //        }
        //
        //                if ($state.current.url == "/admin?uuid") {
        //                    window.onbeforeunload = function (event) {
        //                        var message = 'If you close this window your event will stop.';
        //                        return message;
        //                    }
        //                }
        //                $(window).on('unload', function(){
        //                    $scope.stopEventHandler();
        //                });

        //        window.addEventListener("beforeunload", function (e) {
        //            var answer = confirm("Are you sure you want to leave this page?");
        //            console.log($state);
        //        }, false);

        //        if ($state.current.url == "/admin?uuid") {
        //            $scope.$on('$locationChangeStart', function (event, next, current) {
        //                console.log($state.current.url);
        //                var answer = confirm("Are you sure you want to navigate away from this page");
        //            });
        //        }

        //        $scope.$on('$locationChangeStart', function (event, next, current) {
        //            if ($state.current.url == "/admin?uuid") {
        //                var answer = confirm("Are you sure you want to navigate away from this page");
        //                if (!answer) {
        ////                    event.preventDefault();
        //                    console.log(answer);
        //                } else {
        //                    console.log(answer);
        //                }
        //
        //            }
        //        });

        //        window.onbeforeunload = function (e) {
        //            if (check(document.URL))
        //                return check(document.URL);
        //            else
        //                return undefined;
        //        };

        $rootScope.eventID = $location.search().uuid;
        $scope.eventID = $location.search().uuid;

        $scope.enableModeration = true;


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

        $rootScope.getViewOptions = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/config';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $rootScope.userColor = response.backgroundColor;
                    $rootScope.userSize = response.size;
                }).error(function () {
                    console.log("#");
                })
        }
        $rootScope.getViewOptions();

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
            $window.open($rootScope.baseUrl + "/views/presentation/#/live?uuid=" + $rootScope.eventID, '_blank');
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
            $scope.eventSourceUrl = $rootScope.baseUrl + "/api/adminLiveTweets?uuid=" + $rootScope.eventID;

            var source = new EventSource($scope.eventSourceUrl);

            source.addEventListener('message', function (response) {

                $scope.tweet = JSON.parse(response.data);

                $scope.$apply(function () {
                    $scope.tweetsQueue.push($scope.tweet);
                    $scope.tweetsCount = $rootScope.totalTweetsFromServer + $scope.tweetsQueue.length;
                }, false);
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
                ttl: 6000,
                effect: 'thumbslider',
                type: 'success'
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
                ttl: 6000,
                effect: 'thumbslider',
                type: 'success'
            });

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    // show the notification
                    notification.show();

                    var tweetQueueWithoutTrusted = [];
                    angular.forEach($scope.tweetsQueue, function (tweet) {
                        if (tweet.user.id_str != userID) {
                            tweetQueueWithoutTrusted.push(tweet);
                        }
                    });
                    $scope.tweetsQueue = tweetQueueWithoutTrusted;
                })

        }

        // Stop Event Handler
        $scope.stopEventHandler = function () {

            // create the notification
            var notification = new NotificationFx({
                message: '<p>Hello there! Your event have been stoped.</p>',
                layout: 'growl',
                effect: 'genie',
                type: 'notice'
            });


            var eventID = $rootScope.eventID;
            var requestAction = "DELETE";
            var apiUrl = '/api/events/' + eventID;
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.eventStarted = false;
                    $scope.$broadcast('timer-stop');
                    $rootScope.timerRunning = false;

                    // show the notification
                    notification.show();

                })
        }
}]);
