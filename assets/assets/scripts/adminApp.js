'use strict';

var eventAdminApp = angular.module('eventAdminApp', ['ui.bootstrap', 'timer', 'ngCookies', 'angularFileUpload']);

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

eventAdminApp.run(function ($window, $rootScope) {
    $rootScope.baseUrl = $window.location.origin;
})

// Angular factory allwos you to share data between controllers and pages
eventAdminApp.factory('appVar', function ($rootScope) {
    return {
        eventHashtag: function () {
            $rootScope.eventHashtag = $('#eventHashtag').val();
            if ($rootScope.eventHashtag !== "" || $rootScope.eventHashtag.length >= 3) {
                return ($rootScope.eventHashtag);
            } else {
                return '';
            }
        },
        link: function () {
            return "http://www.twitter.com"
        }
    };
});


/* Factory to post the requestes */
eventAdminApp.factory('getData', ['$http', '$rootScope', 'appVar', '$cookies', '$cookieStore', '$location', '$window', function ($http, $rootScope, appVar, $cookies, $cookieStore, $location, $window) {

    return {

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

eventAdminApp.factory('shareData', function ($rootScope, $cookies, $cookieStore, $window, filterFilter) {


    // LAYOUT : Colors
    $rootScope.layoutColors = ['black', 'turquoise', 'blue', 'violet', 'pink', 'green', 'orange'];
    $rootScope.userColor = $rootScope.layoutColors[0];

    $rootScope.layoutColor = function ($index) {
        $rootScope.userColor = $rootScope.layoutColors[$index];
        $cookies.userColor = $rootScope.userColor;
    }

    // LAYOUT : Sizes
    $rootScope.layoutSizes = ['Small', 'Normal', 'Large'];
    $rootScope.userSize = $rootScope.layoutSizes[1];

    $rootScope.layoutSize = function ($index) {
        $rootScope.userSize = $rootScope.layoutSizes[$index];
        $cookies.userSize = $rootScope.userSize;
    }

    // LAYOUT : Screens
    $rootScope.layoutScreens = [
        {
            name: 'Live Tweets',
            value: '/live',
            selected: true
        },
        {
            name: 'Top People',
            value: '/top',
            selected: false
        },
        {
            name: 'Tweets Over Time',
            value: '/overtime',
            selected: false
        }
    ];


    $rootScope.selection = ['/live'];

    // toggle selection for a given fruit by name
    $rootScope.toggleSelection = function toggleSelection(screen) {

        var idx = $rootScope.selection.indexOf(screen.value);

        if (idx > -1) {
            $rootScope.selection.splice(idx, 1);
        } else {
            $rootScope.selection.push(screen.value);
        }
    };

    $cookies.userScreen = $rootScope.selection;

    return {
        userColor: function () {
            return $cookies.userColor;
        },
        userSize: function () {
            return $cookies.userSize;
        },
        userScreen: function () {
            return $cookies.userScreen;
        }
    };
});

// UI Customization
eventAdminApp.controller("liveViewCtrl", function ($scope, $rootScope, $cookies, $cookieStore, $window, shareData) {

    // Layout : Color
    //    $rootScope.userColor = shareData.userColor();
    // Layout : Size
    //    $rootScope.userSize = shareData.userSize();

});


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
        var eventID = $cookies.eventID;

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
        var eventID = $cookies.eventID;

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

/* startEventHandler controller for the admin front page */
eventAdminApp.controller('SuperAdminCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$location', '$window', 'getData', 'appVar', 'shareData',
   function ($rootScope, $scope, $http, $cookies, $cookieStore, $location, $window, getData, appVar, shareData) {
       
       var requestAction = "GET";
       var apiUrl = '/api/events/superAdmin/';
       var requestData = "";

       getData.fetchData(requestAction, apiUrl, requestData)
           .then(function (response) {
                $scope.serverEvents = response.data;
                    consoel.log($scope.serverEvents);
       })
   
}]);       
       
/* startEventHandler controller for the admin front page */
eventAdminApp.controller('startEventHandler', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$location', '$window', 'getData', 'appVar', 'shareData',
   function ($rootScope, $scope, $http, $cookies, $cookieStore, $location, $window, getData, appVar, shareData) {

        $scope.startEventHandler = function (action) {
            $scope.$broadcast();
            $scope.timerRunning = true;

            getData.startEvent()
                .success(function (response) {
                    $rootScope.eventStarted = true;
                    $rootScope.eventID = response.uuid;
                    $scope.adminUrl = "/admin/admin.html?uuid=" + $scope.eventID;
                    $window.location.href = $scope.adminUrl;

                    $cookies.eventID = $rootScope.eventID;
                    $cookies.eventHashtag = $rootScope.eventHashtag;

                    console.log("New Event Started");
                })
        };


   }]);


/* Main controller for the application */
eventAdminApp.controller('startEventCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$location', '$window', 'getData', 'appVar', 'shareData', '$anchorScroll',
                                            function ($rootScope, $scope, $http, $cookies, $cookieStore, $location, $window, getData, appVar, shareData, $anchorScroll) {

        var eventID = $cookies.eventID;
        $rootScope.eventHashtag = $cookies.eventHashtag;

        $scope.updateBlockedUsers = function (e, screenName, userPicture) {

            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/blockedUsers/' + screenName;
            var requestData = "";

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            $("#" + tweetId).remove();

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
                })

        }

        $scope.updateTrustedUsers = function (e, screenName, userPicture) {

            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/trustedUsers/' + screenName;
            var requestData = "";

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            $("#" + tweetId).remove();

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
                })

        }


        // Layout : Color
        $rootScope.userColor = shareData.userColor();
        // Layout : Size
        $rootScope.userSize = shareData.userSize();

        // Start New Event Handler
        $scope.eventStarted = false;
        $rootScope.timerRunning = false;
        $scope.tweetsQueue = [];
        $scope.tweetsCount = 0;
        $scope.tweet = {};

        // Listen to new message

        $scope.startEventSource = function () {
            $scope.eventSourceUrl = $rootScope.baseUrl + "/api/adminLiveTweets?uuid=" + $cookies.eventID;

            var source = new EventSource($scope.eventSourceUrl);

            source.addEventListener('message', function (response) {

                $scope.tweet = JSON.parse(response.data);

                $scope.$apply(function () {
                    $scope.tweetsQueue.push($scope.tweet);
                    $scope.tweetsCount = $scope.tweetsQueue.length;
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

        $scope.removeTweet = function (e) {

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            var eventID = $cookies.eventID;
            var requestAction = "POST";
            var apiUrl = '/api/events/' + eventID + '/blockedTweets/' + tweetId;
            var requestData = "";

            getData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    console.log("Tweet Removed");
                    $("#" + tweetId).remove();
                    $scope.removedTweetsCount++;
                })
        }

        // Approve Tweet
        $scope.approvedTweetsCount = 0;

        $scope.approveTweet = function (e) {

            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
            var eventID = $cookies.eventID;
            var requestAction = "POST";
            var apiUrl = '/api/events/' + eventID + '/approvedTweets/' + tweetId;
            var requestData = "";

            getData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    console.log("Tweet Approved");
                    $("#" + tweetId).remove();
                    $scope.approvedTweetsCount++;
                })
        }

        // Approve Tweet As Starred
        $scope.approveStarred = function (e) {
            var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');

            var dataObj = {
                action: "approve_starred",
                tweet_id: tweetId
            };
            var res = $http.post('do', dataObj);
            res.success(function (data, status, headers, config) {
                if (data == "OK") {
                    $("#" + tweetId).remove();
                } else
                    alert(data);
            });
        }

        // Stop Event Handler

        $scope.stopEventHandler = function () {

            // create the notification
            var notification = new NotificationFx({
                message: '<p>Hello there! Your event have been stoped.</p>',
                layout: 'growl',
                effect: 'genie',
                type: 'notice' // notice, warning, error or success
            });


            var eventID = $cookies.eventID;
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
            var eventID = $cookies.eventID;
            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/config';

            var eventID = $cookies.eventID;
            var userColor = shareData.userColor();
            var userSize = shareData.userSize();
            var userScreen = shareData.userScreen();

            var requestData = {
                "backgroundColor": userColor,
                "screens": [userScreen],
                "size": userSize

            };
            getData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    console.log("Options Updated");
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