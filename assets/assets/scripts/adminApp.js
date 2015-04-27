'use strict';

var eventAdminApp = angular.module('eventAdminApp', ['ui.bootstrap', 'timer', 'ngCookies', 'angularFileUpload']);

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
eventAdminApp.factory('getData', ['$http', '$rootScope', 'appVar', '$cookies', '$cookieStore', function ($http, $rootScope, $cookies, $cookieStore, appVar) {

    return {

        fetchData: function (requestAction, apiUrl, requestData) {

            var baseUrl = "http://localhost:8080";
            var requestUrl = baseUrl + apiUrl;

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

            return $http({
                method: 'POST',
                url: '/api/events',
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
        },

        // GET : Trusted Users
        getTrustedUsers: function (eventId) {

            $rootScope.getTrustedUsersUrl = 'http://localhost:8080/api/events/' + eventId + '/trustedUsers';

            return $http({
                method: 'GET',
                url: $rootScope.getTrustedUsersUrl,
            }).success(function () {
                console.log("Request successed");
            }).error(function () {
                console.log("Request failed");
            });
        },

        // PUT : Trusted Users
        updateTrustedUsers: function (eventId, trustedScreenName) {

            $rootScope.updateTrustedUsersUrl = 'http://localhost:8080/api/events/' + eventId + '/trustedUsers/' + trustedScreenName;

            return $http({
                method: 'PUT',
                url: $rootScope.updateTrustedUsersUrl,
            }).success(function () {
                console.log("Request successed");
            }).error(function () {
                console.log("Request failed");
            });
        },


        // DELETE : Trusted Users
        deleteTrustedUser: function (eventId, trustedScreenName) {

            $rootScope.updateTrustedUsersUrl = 'http://localhost:8080/api/events/' + eventId + '/trustedUsers/' + trustedScreenName;

            return $http({
                method: 'DELETE',
                url: $rootScope.updateTrustedUsersUrl,
            }).success(function () {
                console.log("Request successed");
            }).error(function () {
                console.log("Request failed");
            });
        },

        // GET : Blocked Users
        getBlockedUsers: function (eventId) {

            $rootScope.getBlockedUsersUrl = 'http://localhost:8080/api/events/' + eventId + '/blockedUsers';

            return $http({
                method: 'GET',
                url: $rootScope.getBlockedUsersUrl,
            }).success(function () {
                console.log("Request successed");
            }).error(function () {
                console.log("Request failed");
            });
        },

        // PUT : Trusted Users
        updateBlockedUsers: function (eventId, blockedScreenName) {

            $rootScope.updateBlockedUsersUrl = 'http://localhost:8080/api/events/' + eventId + '/blockedUsers/' + blockedScreenName;

            return $http({
                method: 'PUT',
                url: $rootScope.updateBlockedUsersUrl,
            }).success(function () {
                console.log("Request successed");
            }).error(function () {
                console.log("Request failed");
            });
        },


        // DELETE : Trusted Users
        deleteBlockedUser: function (eventId, blockedScreenName) {

            $rootScope.updateBlockedUsersUrl = 'http://localhost:8080/api/events/' + eventId + '/blockedUsers/' + blockedScreenName;

            return $http({
                method: 'DELETE',
                url: $rootScope.updateBlockedUsersUrl,
            }).success(function () {
                console.log("Request successed");
            }).error(function () {
                console.log("Request failed");
            });
        },

        // PUT : Update Layout Configuration
        updateViewOptions: function (eventId, userColor, userSize, userScreen) {

            $rootScope.updateViewOptionsUrl = 'http://localhost:8080/api/events/' + eventId + '/config';

            return $http({
                method: 'PUT',
                url: $rootScope.updateViewOptionsUrl,
                data: {
                    "backgroundColor": userColor,
                    "screens": [userScreen],
                    "size": userSize

                },
            }).success(function () {
                console.log("Request successed");
            }).error(function () {
                console.log("Request failed");
            });
        },

        // PUT : Update Layout Configuration
        getViewOptions: function (eventId) {

            $rootScope.getViewOptionsUrl = 'http://localhost:8080/api/events/' + eventId + '/config';

            return $http({
                method: 'GET',
                url: $rootScope.getViewOptionsUrl,
            }).success(function () {
                console.log("Request successed");
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

//    $rootScope.layoutScreens = ["/live", "/top", "/overtime"];
//    $rootScope.userScreen = $rootScope.layoutScreens;
//    $cookies.userScreen = $rootScope.userScreen;

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

/*
// Trusted Users Handlers
// Controller : Create Trusted Users Modal Instance
// Controller : Populate Trusted Users Data
*/
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

        getData.getTrustedUsers(eventID)
            .then(function (response) {
                $scope.trustedUsers = response.data;
                console.log($scope.trustedUsers);
            })

        // Add Approved Users
        $scope.updateTrustedUsers = function () {

            var screenName = $scope.trustedUsername;
            getData.updateTrustedUsers(eventID, screenName)
                .then(function (response) {
                    $scope.trustedUsers.push($scope.trustedUsername);
                    console.log(response);
                    console.log(screenName);
                })
        }

        // Remove Approved Users
        $scope.deleteTrustedUsername = function (index) {

            var screenName = $scope.trustedUsers[index];

            getData.deleteTrustedUser(eventID, screenName)
                .then(function (response) {
                    $scope.trustedUsers.splice(index, 1);
                })
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);

/*
// Blocked Users Handlers
// Controller : Create Trusted Users Modal Instance
// Controller : Populate Trusted Users Data
*/

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

        getData.getBlockedUsers(eventID)
            .then(function (response) {
                $scope.blockedUsers = response.data;
                console.log($scope.blockedUsers);
            })

        // Add Approved Users
        $scope.updateBlockedUsers = function () {
            var screenName = $scope.blockedUsername;
            getData.updateBlockedUsers(eventID, screenName)
                .then(function (response) {
                    $scope.blockedUsers.push($scope.blockedUsername);
                    console.log(response);
                    console.log(screenName);
                })
        }

        // Remove Approved Users
        $scope.deleteBlockedUsername = function (index) {

            var screenName = $scope.blockedUsers[index];

            getData.deleteBlockedUser(eventID, screenName)
                .then(function (response) {
                    $scope.blockedUsers.splice(index, 1);
                })
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);

/* Main controller for the application */
eventAdminApp.controller('startEventCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$location', '$window', 'getData', 'appVar', 'shareData',
   function ($rootScope, $scope, $http, $cookies, $cookieStore, $location, $window, getData, appVar, shareData) {

       var eventID = $cookies.eventID;
       $rootScope.eventHashtag = $cookies.eventHashtag;

        $scope.updateBlockedUsers = function (screenName) {
            getData.updateBlockedUsers(eventID, screenName)
                .then(function (response) {
                    console.log(response);
                    console.log(screenName);
                })
        }

        $scope.updateTrustedUsers = function (screenName, userPicture) {

            // create the notification
            var notification = new NotificationFx({
                message: '<div class="ns-thumb"><img src="' + userPicture + '"/></div><div class="ns-content"><p><a href="#">"' + screenName + '</a> haven been added to trusted users list.</p></div>',
                layout: 'other',
                ttl: 6000,
                effect: 'thumbslider',
                type: 'success'
            });

            getData.updateTrustedUsers(eventID, screenName)
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

        $scope.startEventHandler = function (action) {
            $scope.$broadcast( );
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

        // Listen to new message

       $scope.eventSourceUrl = "http://localhost:8080/api/adminLiveTweets?uuid=" + $cookies.eventID;


        var source = new EventSource($scope.eventSourceUrl);

        source.addEventListener('message', function (response) {

            $scope.tweet = JSON.parse(response.data);

            $scope.$apply(function () {
                $scope.tweetsQueue.push($scope.tweet);
                $scope.tweetsCount = $scope.tweetsQueue.length;
            }, false);
        });

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
                effect: 'jelly',
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
                    console.log("Event Stopped");

                    // show the notification
                    notification.show();

                })
        }

        // Update Config
        $scope.updateViewOptions = function () {
            var eventID = $cookies.eventID;
            var userColor = shareData.userColor();
            var userSize = shareData.userSize();
            var userScreen = shareData.userScreen();

            getData.updateViewOptions(eventID, userColor, userSize, userScreen)
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
