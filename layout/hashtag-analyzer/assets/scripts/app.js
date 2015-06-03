'use strict';

var trackHashtagApp = angular.module('trackHashtagApp', ['ui.bootstrap', 'ui.router', 'myAppDirectives', 'myAppFilters', 'highcharts-ng', 'oitozero.ngSweetAlert', 'iso-3166-country-codes', 'googlechart', 'bootstrapLightbox', 'ngSanitize', 'wu.masonry', 'angular-images-loaded', 'ngCookies', 'angularMoment']);


// Run : Intliaize the event admin app with this values
trackHashtagApp.run(function ($window, $location, $rootScope, $cookies) {
    $rootScope.baseUrl = $window.location.origin;
    $rootScope.twitterBaseUrl = "http://www.twitter.com/";
    $rootScope.eventID = $location.search().uuid;
    $rootScope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";
})

trackHashtagApp.config(function (LightboxProvider) {
    // set a custom template
    LightboxProvider.templateUrl = 'views/views-components/lightbox-modal.html';

    LightboxProvider.getImageUrl = function (media) {
        return media.url;
    };

    LightboxProvider.getImageCaption = function (media) {
        return media.caption;
    };

    LightboxProvider.getImageType = function (media) {
        return media.type;
    };
});

trackHashtagApp.config(function ($stateProvider, $urlRouterProvider) {
    window.routes = {
        "home": {
            url: '',
            templateUrl: 'views/index.html',
            controller: 'StartNewEventController'
        },
        "dashboard": {
            url: '/dashboard?uuid',
            templateUrl: 'views/dashboard.html',
            controller: 'EventMainController'
        },
        "dashboard.liveStreaming": {
            url: '/liveStreaming',
            templateUrl: 'views/views-components/live-streaming.html'
        },
        "dashboard.media": {
            url: '/media',
            templateUrl: 'views/views-components/media.html'
        },

        "superAdmin": {
            url: '/superAdmin',
            templateUrl: 'views/super-admin.html',
            controller: 'SuperAdminCtrl'
        }
    };

    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('home');

});


//Inputs a number and outputs an array with that length. 
//(3 | array) => [0,1,2]
trackHashtagApp.filter('array', function () {
    return function (arrayLength) {
        arrayLength = Math.ceil(arrayLength);
        var arr = new Array(arrayLength),
            i = 0;
        for (; i < arrayLength; i++) {
            arr[i] = i;
        }
        return arr;
    };
});


// Factory : Create event source which is listen to new coming tweets and views layout cusomization changes
trackHashtagApp.factory('CreateEventSource', ['$rootScope', '$location', 'RequestData', function ($rootScope, $location, RequestData) {

    this.eventSourceObject;
    this.closed;

    return {
        createSource: function () {
            var apiUrl = "/api/liveTweets?uuid=" + $rootScope.eventID;
            var requestUrl = $rootScope.baseUrl + apiUrl;
            $rootScope.liveTweetsUrl = requestUrl;
            this.eventSourceObject = new EventSource($rootScope.liveTweetsUrl);

            this.closed = false;
            return this.eventSourceObject;
        },

        getSourceObject: function () {
            return this.eventSourceObject || this.createSource();
        },

        closeEventSource: function () {
            if (this.eventSourceObject != null || this.eventSourceObject != undefined) {
                this.eventSourceObject.close();
                this.eventSourceObject = undefined;
                this.closed = true;
                return;
            }
        }
    }

}]);

// Factory : Request data factory for : Start event & Any other request
trackHashtagApp.factory('RequestData', ['$rootScope', '$http', '$location', '$window', '$cookies', function ($rootScope, $http, $location, $window, $cookies) {

    return {
        fetchData: function (requestAction, apiUrl, requestData) {

            var requestUrl = $rootScope.baseUrl + apiUrl;

            return $http({
                method: requestAction,
                url: requestUrl,
                data: requestData
            }).success(function (response) {
                console.log("Request Successed");
                return response.data;
            }).error(function () {
                console.log("Request failed");
            });
        },

        startEvent: function (requestAction) {

            var eventHashtag = $('#eventHashtag').val();
            var requestUrl = $rootScope.baseUrl + '/api/events?authToken=' + $cookies.userAuthentication;

            return $http({
                method: 'POST',
                url: requestUrl,
                data: {
                    "hashTags": [eventHashtag]
                }
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

/* Controller : Super admin page */
trackHashtagApp.controller('SuperAdminCtrl', ['$rootScope', '$scope', '$http', 'RequestData', function ($rootScope, $scope, $http, RequestData) {

    var requestAction = "GET";
    var apiUrl = '/api/events/superAdmin/';
    var requestData = "";

    RequestData.fetchData(requestAction, apiUrl, requestData)
        .then(function (response) {
            $scope.serverEvents = response.data.data;
        })

    $scope.killEvent = function (e) {

        var eventID = $(e.currentTarget).parent().parent().attr('id');

        var requestAction = "DELETE";
        var apiUrl = '/api/events/' + eventID;
        var requestData = "";

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                console.log(response);
            })

    }

}]);

trackHashtagApp.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

/* Controller : Start new event */
trackHashtagApp.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', '$cookies', '$cookieStore', '$location', '$window', function ($rootScope, $scope, $http, $state, RequestData, $cookies, $cookieStore, $location, $window) {

    $scope.startNewEvent = function (action) {
        // Check if there is an authentication key in the browser cookies
        if ($cookies.userAuthentication == undefined) {

            var requestAction = "GET";
            var apiUrl = '/api/events/login/twitter?hashtags=' + $scope.eventHashtag;
            var requestData = ""
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    var openUrl = response.data.url;
                    $window.location.href = openUrl;
                    console.log(response);
                });
        } else {

            $scope.$broadcast();
            RequestData.startEvent()
                .success(function (response) {
                    $rootScope.eventID = response.uuid;
                    // Redirect the front website page to the admin page
                    $state.transitionTo('dashboard.liveStreaming', {
                        uuid: $scope.eventID
                    });
                })
        }
    };
}]);


// Controller : Populate the recieved data and update admin page
trackHashtagApp.controller('EventMainController', ['$rootScope', '$scope', '$http', '$location', '$window', '$anchorScroll', '$state', 'RequestData', 'CreateEventSource', '$timeout', 'SweetAlert', 'ISO3166', 'Lightbox', '$modal', '$sce', '$cookies', '$cookieStore',
                                            function ($rootScope, $scope, $http, $location, $window, $anchorScroll, $state, RequestData, CreateEventSource, $timeout, SweetAlert, ISO3166, Lightbox, $modal, $sce, $cookies, $cookieStore) {
                                                
                                                
                                                $scope.dynamicPopover = {
    content: 'Hello, World!',
    templateUrl: 'myPopoverTemplate.html',
    title: 'Title'
  };

        // SET : Event UUID, userAuthentication, Hashtags, Username, Profile images, User ID
        $rootScope.eventID = $location.search().uuid;

        if ($cookies.userAuthentication == undefined) {
            $rootScope.authToken = $location.search().authToken;
            $cookies.userAuthentication = $rootScope.authToken;
        } else {
            $rootScope.authToken = $cookies.userAuthentication;
        }

        if ($cookies.hashtags == undefined) {
            $rootScope.hashtags = $location.search().hashtags;
            $cookies.hashtags = $rootScope.hashtags;
        } else {
            $rootScope.hashtags = $cookies.hashtags;
        }

        if ($cookies.authoUserName == undefined) {
            $rootScope.authoUserName = $location.search().screenName;
            $cookies.authoUserName = $rootScope.authoUserName;
        } else {
            $rootScope.authoUserName = $cookies.authoUserName;
        }


        if ($cookies.authoUserID == undefined) {
            $rootScope.authoUserID = $location.search().userId;
            $cookies.authoUserID = $rootScope.authoUserID
        } else {
            $rootScope.authoUserID = $cookies.authoUserID;
        }


        if ($cookies.authoUserPicture == undefined) {
            $rootScope.authoUserPicture = $location.search().profileImageUrl;
            $cookies.authoUserPicture = $rootScope.authoUserPicture
        } else {
            $rootScope.authoUserPicture = $cookies.authoUserPicture;
        }

        // Truse Source : fix ng-src videos issue
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }

        // Lightbox for media
        $scope.Lightbox = Lightbox;

        var locationChart = {};
        $scope.locationChart = locationChart;

        $scope.drawLocationChart = function () {

            locationChart.type = "GeoChart";
            locationChart.data = [['Locale', 'Count']];

            locationChart.options = {
                height: 250,
                colorAxis: {
                    colors: ['rgb(0, 200, 220)', 'rgb(0, 100, 200)', 'rgb(1, 120, 183)']
                },
                displayMode: 'regions'
            };

            locationChart.formatters = {
                number: [{
                    columnNum: 1
                }]
            };

        }

        // GET : Top active people
        $scope.topPeople = [];
        $scope.getTopPeople = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topUsers';
            var topUsersCount = 10;

            var requestData = {
                "count": topUsersCount
            };

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.topPeople = response.data.topUsers;
                });
        }
        $scope.getTopPeople();



        // TOP TWEETS : Not Working
        $scope.getTopTweets = function () {

            var apiUrl = '/api/events/' + $rootScope.eventID + '/topTweets';
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {}).error(function () {
                    console.log(response);
                })
        };

        $scope.enableModeration = false;
        $scope.moderationStatus = function () {

            var apiUrl = '/api/events/' + $rootScope.eventID + '/moderation';
            var requestAction = "DELETE";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {}).error(function () {
                    console.log("#");
                })
        };
        $scope.moderationStatus();

        $rootScope.getLocationStats = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topCountries';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.topCountries = response.items;
                    for (var i = 0; i < response.items.length; i++) {
                        locationChart.data.push([response.items[i].code, response.items[i].count]);
                    }
                }).error(function () {
                    console.log("#");
                })
        }
        $rootScope.getLocationStats();
        $scope.drawLocationChart();

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
                    $scope.totalMedia = response.totalMedia;
                    var myDate = new Date($scope.startTime);
                    $scope.startTimeMilliseconds = myDate.getTime();
                }).error(function () {
                    console.log("#");
                })
        }
        $rootScope.getEventStats();

        $rootScope.getViewOptions = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/config';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.eventHashtag = response.hashtags[0];

                }).error(function () {
                    console.log("#");
                })
        }
        $rootScope.getViewOptions();

        // Start New Event Handler
        $scope.eventStarted = false;
        $rootScope.timerRunning = false;
        $scope.tweetsQueue = [];
        $scope.lastNewTweets = [];
        $scope.tweetsQueueLength = 0;
        $scope.mediaQueue = [];
        $scope.tweet = {};

        // Listen to new message
        $scope.startEventSource = function () {
            $scope.eventSourceUrl = $rootScope.baseUrl + "/api/liveTweets?uuid=" + $rootScope.eventID;

            var source = new EventSource($scope.eventSourceUrl);
            console.log(source);
            console.log(CreateEventSource.getSourceObject());
            console.log(CreateEventSource.closeEventSource());


            source.addEventListener('approved-tweets', function (response) {

                $scope.tweet = JSON.parse(response.data);

                if ($scope.tweet.extended_entities != null && $scope.tweet.extended_entities.media != null) {

                    var mediaArrayLength = $scope.tweet.extended_entities.media.length;

                    $scope.tweetText = $scope.tweet.text;
                    $scope.userScreenName = $scope.tweet.user.screen_name;
                    $scope.userProfileImage = $scope.tweet.user.profile_image_url_https;
                    $scope.tweetCreatedAt = $scope.tweet.created_at;

                    for (var i = 0; i < mediaArrayLength; i++) {

                        $scope.mediaType = $scope.tweet.extended_entities.media[i].type;
                        $scope.mediaThumb = $scope.tweet.extended_entities.media[i].media_url_https;

                        // Push only MP4 videos
                        if ($scope.mediaType == 'video') {
                            var videoVariantsArrayLength = $scope.tweet.extended_entities.media[i].video_info.variants.length;
                            for (var k = 0; k < videoVariantsArrayLength; k++) {
                                var videoContentType = $scope.tweet.extended_entities.media[i].video_info.variants[k].content_type;
                                if (videoContentType == "video/mp4") {
                                    $scope.videoLink = $scope.tweet.extended_entities.media[i].video_info.variants[k].url;
                                    $scope.mediaQueue.push({
                                        "url": $scope.videoLink,
                                        "thumb": $scope.mediaThumb,
                                        "type": $scope.mediaType,
                                        "caption": $scope.tweetText,
                                        "userScreenName": $scope.userScreenName,
                                        "userProfileImage": $scope.userProfileImage,
                                        "tweetCreatedAt": $scope.tweetCreatedAt
                                    });
                                }
                            }

                        } else {
                            $scope.tweetMedia = $scope.tweet.extended_entities.media[i].media_url_https;
                            $scope.mediaQueue.push({
                                "url": $scope.tweetMedia,
                                "thumb": $scope.mediaThumb,
                                "type": $scope.mediaType,
                                "caption": $scope.tweetText,
                                "userScreenName": $scope.userScreenName,
                                "userProfileImage": $scope.userProfileImage,
                                "tweetCreatedAt": $scope.tweetCreatedAt
                            });
                        }
                    }

                }

                $scope.$apply(function () {
                    $scope.tweetsQueue.push($scope.tweet);
//                    if ($scope.tweetsQueue.length < 25) {
//                        $scope.tweetsQueue.push($scope.tweet);
//                    } else {
//                        $scope.lastNewTweets.unshift($scope.tweet);
//                    }
                    $scope.tweetsQueueLength++;

                }, false);
            });

            source.addEventListener('tweets-over-time', function (response) {

                $scope.data = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.drawChart($scope.data);
                }, false);
            });


            source.addEventListener('new-admin-opened', function (response) {
                //                source.close();
            });
        }

        $scope.startEventSource();

        $scope.openLightboxModal = function (index) {
            Lightbox.openModal($scope.mediaQueue, index);
        };

        $scope.pagesShown = 1;
        $scope.pageSize = 25;
        $scope.tweetsShowned = 0;

        $scope.tweetsGab = false;

        // Tweet queue limit
        $scope.tweetsQueueLimit = function () {
            $scope.tweetsShowned = $scope.pageSize * $scope.pagesShown;
            return $scope.pageSize * $scope.pagesShown;
        };

        // Show load more button
        $scope.loadMoreButton = function () {
            $scope.remainingTweetsCount = $scope.tweetsQueueLength - ($scope.pageSize * $scope.pagesShown);
            $scope.tweetsShowned = $scope.pageSize * $scope.pagesShown;
            return $scope.pagesShown < ($scope.tweetsQueueLength / $scope.pageSize);

        }

        // Load more tweets handler
        $scope.loadMoreTweets = function () {
            $scope.tweetsQueue = $scope.tweetsQueue.concat($scope.lastNewTweets);
            $scope.pagesShown++;
            $scope.lastNewTweets = [];
            console.log($scope.lastNewTweets.length);
            console.log($scope.tweetsQueue.length);
            $scope.remainingTweetsCount = $scope.tweetsQueueLength - ($scope.pageSize * $scope.pagesShown);
        };

        // Show tweets Gab Container
//        $scope.tweetsGabContainer = function () {
//            if ($scope.remainingTweetsCount >= 10) {
//                $scope.tweetsGab = true;
//            }
//            return $scope.tweetsGab;
//        }

        // Load tweets on Gab
//        $scope.loadTweetsOnGab = function () {
//
//        }

        // Stop Event Handler
        $scope.killEvent = function () {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Your will not be able to recover this hashtag tracking!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, stop it!",
                    closeOnConfirm: false
                },
                function (isConfirm) {
                    if (isConfirm) {
                        $scope.stopEventHandler();
                        SweetAlert.swal("Deleted!", "Your event has been deleted.", "success");
                    } else {
                        SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
                    }
                });
        };
    
    // Logout
    $scope.logOutUser = function () {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Your will not be able to recover this hashtag tracking!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, stop it!",
                    closeOnConfirm: false
                },
                function (isConfirm) {
                    if (isConfirm) {
                        $cookieStore .remove("authoUserID");
                        $cookieStore .remove("authoUserName");
                        $cookieStore .remove("authoUserPicture");
                        $cookieStore .remove("hashtags");
                        $cookieStore .remove("userAuthentication");
                        $scope.stopEventHandler();
                        SweetAlert.swal("Deleted!", "Your event has been deleted.", "success");
                    } else {
                        SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
                    }
                });
        };

        $scope.stopEventHandler = function () {

            var eventID = $rootScope.eventID;
            var requestAction = "DELETE";
            var apiUrl = '/api/events/' + eventID + "?authToken=" + $cookies.userAuthentication;
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.eventStarted = false;
                    $state.transitionTo('home');
                })
        }


        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'areaspline',
                    height: 250,
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                },
                title: {
                    text: ''
                }

            },
        };
        $scope.tweetsTime = [];
        $scope.tweetsCount = [];

        $scope.drawChart = function () {

            $scope.tweetsTime = $scope.data.time;
            $scope.tweetsCount = $scope.data.tweets_count;

            function drawTweetsOverTimeChart() {
                var arrayLength = $scope.data.length;
                var tweetsCountArray = [];
                var tweetsTimeArray = [];

                $scope.totalTweets = 0;
                for (var i = 0; i < arrayLength; i++) {
                    tweetsCountArray[i] = $scope.data[i].tweets_count;
                    $scope.totalTweets += $scope.data[i].tweets_count;
                    tweetsTimeArray[i] = $scope.data[i].time;
                }

                $scope.chartSeries = [{
                    "name": "Tweets count",
                    "data": tweetsCountArray,
                    showInLegend: false,
                    "id": "tweetsChart",
                    color: "rgb(22, 123, 230)"
    }];
                $scope.chartConfig = {
                    options: {
                        chart: {
                            type: 'areaspline',
                            animation: {
                                duration: 1500
                            },
                            height: 250,
                            backgroundColor: 'rgba(255, 255, 255, 0.01)'
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: false
                                },
                                stacking: '',
                                connectNulls: false
                            },
                            areaspline: {}
                        }
                    },
                    xAxis: {
                        categories: tweetsTimeArray,
                        gridLineWidth: 1,
                        gridLineColor: "rgb(245, 245, 245)",
                        dateTimeLabelFormats: {
                            minute: '%H:%M',
                            hour: '%H:%M',
                        },
                        type: 'datetime',
                        lineWidth: 1,
                        labels: {
                            enabled: true,
                            style: {
                                color: '#d5d5d5',
                                font: '11px Trebuchet MS, Verdana, sans-serif'
                            }
                        },
                    },
                    yAxis: {
                        plotLines: [{
                            value: 0,
                            width: 0,
                            color: '#ffffff'
                }],
                        title: {
                            text: ''
                        },
                        labels: {
                            enabled: false
                        },
                        tickWidth: 0,
                        gridLineWidth: 1,
                        gridLineColor: "rgb(245, 245, 245)"
                    },
                    series: $scope.chartSeries,
                    credits: {
                        enabled: false
                    },
                    loading: false,
                    title: {
                        text: ''
                    }
                };
                $scope.reflow = function () {
                    $scope.$broadcast('highchartsng.reflow');
                };
            }

            drawTweetsOverTimeChart();

        }

}]);