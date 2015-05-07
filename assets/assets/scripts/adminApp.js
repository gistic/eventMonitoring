'use strict';

var eventAdminApp = angular.module('eventAdminApp', ['ui.bootstrap', 'timer', 'ngCookies', 'ui.router', 'angularFileUpload']);


eventAdminApp.run(function ($window, $rootScope) {
    $rootScope.baseUrl = $window.location.origin;
    $rootScope.twitterBaseUrl = "http://www.twitter.com/";
})

// Config : Views pages routing
eventAdminApp.config(function ($stateProvider, $urlRouterProvider) {

    window.routes = {
        "/": {
            url: '',
            templateUrl: '../../admin/admin-views/index.html',
            controller: 'StartNewEventController'
        },
        "admin": {
            url: '/admin?uuid',
            templateUrl: '../../admin/admin-views/admin.html',
            controller: 'startEventCtrl'
        },
        "superAdmin": {
            url: '/superAdmin',
            templateUrl: '../../admin/admin-views/super-admin.html',
            controller: 'SuperAdminCtrl'
        }
    };

    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});


eventAdminApp.directive('errSrc', function ($rootScope) {
    $rootScope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";

    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});

// Activate ' ENTER ' keypress to make the same action as click
eventAdminApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

// Filter to reverse Tweets Queue
eventAdminApp.filter('reverseQueue', function () {
    return function (tweetsQueue) {
        return tweetsQueue.slice().reverse();
    };
});


// Angular factory allwos you to share data between controllers and pages
//eventAdminApp.factory function ($rootScope) {
//    return {
//        eventHashtag: function () {
//            $rootScope.eventHashtag = $('#eventHashtag').val();
//            if ($rootScope.eventHashtag !== "" || $rootScope.eventHashtag.length >= 3) {
//                return ($rootScope.eventHashtag);
//            } else {
//                return '';
//            }
//        }
//    };
//});


/* Factory to post the requestes */
eventAdminApp.factory('getData', ['$http', '$rootScope', '$cookies', '$cookieStore', '$location', '$window', function ($http, $rootScope, $cookies, $cookieStore, $location, $window) {

    return {

        setEventHashTag: function (eventHashtag) {
            console.log(eventHashtag);
            $rootScope.eventHashtag = eventHashtag;
        },

        getEventHashTag: function () {
            return $rootScope.eventHashtag;
        },

        setEventID: function (eventID) {
            $rootScope.eventID = eventID;
        },

        getEventID: function () {
            return $rootScope.eventID;
        },

        fetchData: function (requestAction, apiUrl, requestData) {

            var requestUrl = $rootScope.baseUrl + apiUrl;
            return $http({
                method: requestAction,
                url: requestUrl,
                data: requestData,
            }).success(function (response) {
                console.log("Request Successed");
            }).error(function () {
                console.log("Request failed");
            });
        },

        startEvent: function (requestAction) {

            var eventHashtag = $('#eventHashtag').val();
            var requestUrl = $rootScope.baseUrl + '/api/events';

            return $http({
                method: 'POST',
                url: requestUrl,
                data: {
                    "hashTags": [eventHashtag]
                },
            }).success(function (response) {
                $rootScope.eventHashtag = eventHashtag;
                $rootScope.eventID = response.uuid;
                return response.uuid;
            }).error(function () {
                console.log("Request failed");
            });
        }

    }

}]);



/**
 * custom filter
 */
eventAdminApp.filter('fruitSelection', ['filterFilter', function (filterFilter) {
    return function fruitSelection(input, prop) {
        return filterFilter(input, {
            selected: true
        }).map(function (screen) {
            return screen[prop];
        });
    };
}]);

eventAdminApp.filter('customFilter', function () {
    return function (arr) {
        var alter = [];
        angular.forEach(arr, function (value, key) {
            if (value.selected == true) {
                this.push(value);
            }
        }, alter);
        return alter;
    }
});

eventAdminApp.factory('shareData', function ($rootScope, $cookies, $cookieStore, $window, filterFilter, getData) {



    // LAYOUT : Colors
    $rootScope.layoutColors = ['black', 'turquoise', 'blue', 'violet', 'pink', 'green', 'orange'];
    $rootScope.layoutColor = function ($index) {
        $rootScope.userColor = $rootScope.layoutColors[$index];
    }

    // LAYOUT : Sizes
    $rootScope.layoutSizes = ['small', 'normal', 'large'];
    $rootScope.layoutSize = function ($index) {
        $rootScope.userSize = $rootScope.layoutSizes[$index];
    }

    // LAYOUT : Screens
    $rootScope.layoutScreens = [
        {
            name: 'Live Tweets',
            value: 'live',
            selected: true
        },
        {
            name: 'Top People',
            value: 'top',
            selected: true
        },
        {
            name: 'Tweets Over Time',
            value: 'overtime',
            selected: true
        }
    ];

//    $rootScope.userScreen = ["/live", "/top", "/overtime"];

    return {
        userColor: function () {
            return $rootScope.userColor;
        },
        userSize: function () {
            return $rootScope.userSize;
        },
        userScreen: function () {
            return $rootScope.userScreens;
        }
    };
});

// UI Customization
eventAdminApp.controller("liveViewCtrl", function ($scope, $rootScope, $cookies, $cookieStore, $window, shareData) {});

// Trusted Users Handlers
eventAdminApp.controller('trustedUsersModalCtrl', function ($scope, $modal) {
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: 'trustedUsers.html',
            controller: 'trustedUsersCtrl',
            size: 'sm'
        });

    };
});

eventAdminApp.controller('trustedUsersCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$modalInstance', 'getData',
   function ($rootScope, $scope, $http, $cookies, $cookieStore, $modalInstance, getData) {

        $scope.trustedUsers = [];
        var eventID = $rootScope.eventID;

        var requestAction = "GET";
        var apiUrl = '/api/events/' + eventID + '/trustedUsers';
        var requestData = "";

        // GET : Trusted Users
        getData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                $scope.trustedUsers = response.data;
            })

        // PUT : Trusted User
        $scope.updateTrustedUsers = function () {
            var screenName = $scope.trustedUsername;
            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/trustedUsers/' + screenName;
            var requestData = "";
            getData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.trustedUsers.push($scope.trustedUsername);
                })
        }

        // DELETE : Trusted User
        $scope.deleteTrustedUsername = function (index) {

            var screenName = $scope.trustedUsers[index];
            var requestAction = "DELETE";
            var apiUrl = '/api/events/' + eventID + '/trustedUsers/' + screenName;
            var requestData = "";

            getData.fetchData(requestAction, apiUrl, requestData, screenName)
                .then(function (response) {
                    $scope.trustedUsers.splice(index, 1);
                })
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);


// Blocked Users Handlers
eventAdminApp.controller('blockedUsersModalCtrl', function ($scope, $modal) {
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: 'blockedUsers.html',
            controller: 'blockedUsersCtrl',
            size: 'sm'
        });

    };
});

eventAdminApp.controller('blockedUsersCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$modalInstance', 'getData',
   function ($rootScope, $scope, $http, $cookies, $cookieStore, $modalInstance, getData) {

        $rootScope.blockedUsers = [];
        var eventID = $rootScope.eventID;

        var requestAction = "GET";
        var apiUrl = '/api/events/' + eventID + '/blockedUsers';
        var requestData = "";

        // GET : Blocked Users
        getData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                $scope.blockedUsers = response.data;
            })

        // PUT : Blocked User
        $scope.updateBlockedUsers = function () {
            var screenName = $scope.blockedUsername;
            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/blockedUsers/' + screenName;
            var requestData = "";
            getData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.blockedUsers.push($scope.blockedUsername);
                })
        }

        // DELETE : Trusted User
        $scope.deleteBlockedUsername = function (index) {

            var screenName = $scope.blockedUsers[index];

            var requestAction = "DELETE";
            var apiUrl = '/api/events/' + eventID + '/blockedUsers/' + screenName;
            var requestData = "";

            getData.fetchData(requestAction, apiUrl, requestData, screenName)
                .then(function (response) {
                    $scope.blockedUsers.splice(index, 1);
                })
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);

/* Controller : Super admin page */
eventAdminApp.controller('SuperAdminCtrl', ['$rootScope', '$scope', '$http', 'getData', function ($rootScope, $scope, $http, getData) {

    var requestAction = "GET";
    var apiUrl = '/api/events/superAdmin/';
    var requestData = "";

    getData.fetchData(requestAction, apiUrl, requestData)
        .then(function (response) {
            $scope.serverEvents = response.data.data;
        })

    $scope.killEvent = function (e) {

        var eventID = $(e.currentTarget).parent().parent().attr('id');

        var notification = new NotificationFx({
            message: '<p>Event: <strong>' + eventID + '</strong> have been stoped.</p>',
            layout: 'growl',
            effect: 'genie',
            type: 'notice'
        });

        var requestAction = "DELETE";
        var apiUrl = '/api/events/' + eventID;
        var requestData = "";

        getData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                notification.show();
            })

    }

}]);

/* Controller : Start new event */
eventAdminApp.controller('StartNewEventController', ['$rootScope', '$scope', '$http', 'getData', '$state', function ($rootScope, $scope, $http, getData, $state) {

        $scope.startNewEvent = function (action) {

            $scope.$broadcast();
            
            getData.startEvent()
                .success(function (response) {
                    $rootScope.eventID = response.uuid;
                
                // Redirect the front website page to the admin page
                    $state.transitionTo('admin', {
                        uuid: $scope.eventID
                    });
                })
        };
}]);

/* Controller : Populate the recieved data and update admin views */
eventAdminApp.controller('startEventCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$location', '$window', 'getData', 'shareData', '$anchorScroll', '$state',
                                            function ($rootScope, $scope, $http, $cookies, $cookieStore, $location, $window, getData, shareData, $anchorScroll, $state) {

        $rootScope.eventID = $location.search().uuid;
        $scope.eventID = $location.search().uuid;

        $rootScope.getViewOptions = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/config';
            var requestData = "";

            getData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    console.log(response);
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

            getData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.numberOfUsers = response.numberOfUsers;
                    $rootScope.totalTweetsFromServer = response.totalTweets;
                    $scope.totalRetweets = response.totalRetweets;
                    $scope.startTime = response.startTime;
                    var myDate = new Date($scope.startTime);
                    $scope.startTimeMilliseconds  = myDate.getTime();
                    console.log($scope.startTimeMilliseconds);
                    console.log($scope.startTime);
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
            console.log($rootScope.userScreens);
        }, true);
                                                

        $scope.goLive = function () {
            $window.open($rootScope.baseUrl + "/#/live?uuid=" + $rootScope.eventID, '_blank');
        }

        // Layout : Color
        $rootScope.userColor = shareData.userColor();
        // Layout : Size
        $rootScope.userSize = shareData.userSize();

        // Start New Event Handler
        $scope.eventStarted = false;
        $rootScope.timerRunning = false;
        $scope.tweetsQueue = [];
        $scope.tweet = {};
        $scope.tweetsCount= 0;
        
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

        // Remaining tweets in queue
        //	$scope.remainingTweetsCount = $scope.tweetsCount - ($scope.pagesShown * $scope.pageSize);
        //	console.log($scope.remainingTweetsCount);

        // Remove Tweet From List
        $scope.removedTweetsCount = 0;

        $scope.removeTweet = function (e, $index) {

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            var tweetIndex = $(e.currentTarget).attr('data-id');

            var eventID = $rootScope.eventID;
            var requestAction = "POST";
            var apiUrl = '/api/events/' + eventID + '/blockedTweets/' + tweetId;
            var requestData = "";

            getData.fetchData(requestAction, apiUrl, requestData)
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

            getData.fetchData(requestAction, apiUrl, requestData)
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

            getData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.tweetsQueue.splice(tweetIndex, 1);
                    $scope.approvedTweetsCount++;
                }).error(function () {
                    console.log("#");
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

            getData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.eventStarted = false;
                    $scope.$broadcast('timer-stop');
                    $rootScope.timerRunning = false;
                    $scope.$on('timer-stopped', function (event, data) {
                        console.log('Timer Stopped - data = ', data);
                    });

                    // show the notification
                    notification.show();

                })
        }

        // Update Config
        $scope.updateViewOptions = function (userColor, userSize, userScreen) {

            var eventID = $rootScope.eventID;
            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/config';

            var userColor = shareData.userColor();
            var userSize = shareData.userSize();
            var userScreen = shareData.userScreen();

            var requestData = {
                "backgroundColor": userColor,
                "screens": userScreen,
                "screenTimes": [7000, 5000, 3000],
                "size": userSize

            };
            getData.fetchData(requestAction, apiUrl, requestData)
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

            getData.fetchData(requestAction, apiUrl, requestData)
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

            getData.fetchData(requestAction, apiUrl, requestData)
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


}]);

// Upload File
eventAdminApp.controller('AppController', ['$scope', 'FileUploader', function ($scope, FileUploader) {
    var uploader = $scope.uploader = new FileUploader({
        url: 'upload.php'
    });

    // FILTERS

    uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/ , options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

}]);

// Angular File Upload module does not include this directive
// Only for example
/**
 * The ng-thumb directive
 * @author: nerv
 * @version: 0.1.2, 2014-01-09
 */

eventAdminApp.directive('ngThumb', ['$window', function ($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function (item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function (file) {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function (scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({
                    width: width,
                    height: height
                });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}]);