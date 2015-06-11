var EventHandlerController = angular.module('EventHandlerController', []);

// Controller : Populate the recieved data and update Dashboard
EventHandlerController.controller('EventMainController', ['$rootScope', '$scope', '$http', '$location', '$window', '$anchorScroll', '$state', 'RequestData', 'CreateEventSource', '$timeout', 'SweetAlert', 'ISO3166', 'Lightbox', '$modal', '$sce', '$cookies', '$cookieStore',
                                            function ($rootScope, $scope, $http, $location, $window, $anchorScroll, $state, RequestData, CreateEventSource, $timeout, SweetAlert, ISO3166, Lightbox, $modal, $sce, $cookies, $cookieStore) {

        // Search from the dashboard
        $scope.dashboardSearch = function () {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "If you start a new event you will not be able to recover this hashtag tracking!",
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
                                    });
                            } else { // if "yes"  --> redirect to dashboard page
                                $scope.$broadcast();
                                RequestData.startEvent()
                                    .success(function (response) {
                                        $rootScope.eventID = response.uuid;
                                        // Redirect the front website page to the admin page
                                        $state.transitionTo('dashboard.liveStreaming', {
                                            uuid: $scope.eventID
                                        });
                                        $scope.initData();
                                    })
                            }
                        };
                        $scope.startNewEvent();
                    } else {
                        SweetAlert.swal("Cancelled", "Your event is in safe :)", "error");
                    }
                });
        }

        // GET : View options
        $scope.getViewOptions = function () {

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

        // GET : Event basic stats
        $scope.getEventStats = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/basicStats';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.totalMediaCount = response.totalMedia;
                    $scope.totalUsersCount = response.numberOfUsers;
                    $scope.totalTweetsCount = response.totalTweets;
                }).error(function () {
                    console.log("#");
                })
        }
        
        $scope.intervalFunction = function () {
            $timeout(function () {
                $scope.getEventStats();
            }, 1800000)
        };                                                  
        $scope.intervalFunction();

        // GET : Warm up data for event
        $scope.getWarmupData = function () {
            $(".loading").show();
            var apiUrl = '/api/events/' + $rootScope.eventID + '/cachedTweets';
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.tweet = JSON.parse(response.items[i]);
                        $scope.tweetsQueue.push($scope.tweet);
                    }
                }).error(function () {
                    console.log("#");
                })
        };

        // GET : User data
        $scope.getUserData = function () {
            var apiUrl = '/api/twitterUsers' + '?authToken=' + $cookies.userAuthentication;
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $rootScope.authoUserName = response.screenName;
                    $rootScope.authoUserID = response.id;
                    $rootScope.authoUserPicture = response.originalProfileImageURLHttps;
                }).error(function () {
                    console.log("#");
                })
        };

        // Intialize
        $scope.initData = function () {
            $(".loading").show();
            $scope.getWarmupData();
            $scope.getViewOptions();
            $scope.getEventStats();
            $scope.getUserData();
        }


        $scope.dynamicPopover = {
            templateUrl: 'myPopoverTemplate.html'
        };

        // SET : Event UUID, userAuthentication, Hashtags, Username, Profile images, User ID
        $rootScope.eventID = $location.search().uuid;
        $rootScope.authoUserName = $location.search().screenName;

        if ($cookies.userAuthentication == undefined) {
            $rootScope.authToken = $location.search().authToken;
            $cookies.userAuthentication = $rootScope.authToken;
        } else {
            $rootScope.authToken = $cookies.userAuthentication;
        }

        // Truse Source : fix ng-src videos issue
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }

        // Lightbox for media
        $scope.Lightbox = Lightbox;

        // TOP TWEETS
        $scope.topTweets = [];
        $scope.getTopTweets = function () {
            $(".loading").show();
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topTweets?authToken=' + $cookies.userAuthentication;;
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.tweet = JSON.parse(response.items[i]);
                        $scope.topTweets.push($scope.tweet);
                    }
                    $(".loading").hide();
                }).error(function () {
                    console.log("#");
                })
        };

        $scope.showLoadMore = true;
        $scope.showLoadMoreButton = function () {
            $scope.showLoadMore = true;
            $scope.loadMoreButton();
        }

        $scope.loadMostPopular = function () {
            $scope.showLoadMore = false;
            $scope.getTopTweets();
        }

        // Start New Event Handler
        $scope.eventStarted = false;
        $rootScope.timerRunning = false;

        $scope.tweetsQueue = []; // display
        $scope.lastNewTweets = []; // for button
        $scope.tweetsHistory = []; // history
        $scope.loadTweetsFromHistoryArray = [];

        $scope.tweetsQueueLength = 0;
        $scope.lastNewTweetsLength = 0;

        $scope.mediaQueue = [];
        $scope.lastNewMedia = [];

        $scope.topCountries = [];
        $scope.topPeople = [];

        $scope.tweet = {};
                                                
                                                
        // Close event source if he leave the media or tweet stream stats
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
            if ( toState.name == "dashboard.liveStreaming" || toState.name == "dashboard.media" ) {
            } else {
                CreateEventSource.closeEventSource();
            }
        })

        // Listen to new message
        $scope.startEventSource = function () {
            
            $scope.eventSourceUrl = $rootScope.baseUrl + "/api/liveTweets?uuid=" + $rootScope.eventID;

            var source = CreateEventSource.createSource($scope.eventSourceUrl);

            source.addEventListener('approved-tweets', function (response) {

                $scope.tweet = JSON.parse(response.data);
                
                $scope.totalTweetsCount++;

                // Media
                if ($scope.tweet.extended_media_entities != null) {

                    var mediaArrayLength = $scope.tweet.extended_media_entities.length;

                    $scope.tweetText = $scope.tweet.text;
                    $scope.userScreenName = $scope.tweet.user.screen_name;
                    $scope.userProfileImage = $scope.tweet.user.original_profile_image_urlhttps;
                    $scope.tweetCreatedAt = $scope.tweet.created_at;

                    for (var i = 0; i < mediaArrayLength; i++) {

                        $scope.mediaType = $scope.tweet.extended_media_entities[i].type;
                        $scope.mediaThumb = $scope.tweet.extended_media_entities[i].media_urlhttps;

                        // Push only MP4 videos
                        if ($scope.mediaType == 'video') {
                            var videoVariantsArrayLength = $scope.tweet.extended_media_entities[i].video_variants.length;
                            for (var k = 0; k < videoVariantsArrayLength; k++) {
                                var videoContentType = $scope.tweet.extended_media_entities[i].video_variants[k].content_type;
                                if (videoContentType == "video/mp4") {
                                    $scope.videoLink = $scope.tweet.extended_media_entities[i].video_variants[k].url;
                                    var duplicatedMedia = false;
                                    for (var key in $scope.mediaQueue) {
                                        if ($scope.videoLink == $scope.mediaQueue[key].url) {
                                            duplicatedMedia = true;
                                            break;
                                        } else {
                                            duplicatedMedia = false;
                                        }
                                    }
                                    if (!duplicatedMedia) {
                                        $scope.mediaVideoObject = {
                                            "url": $scope.videoLink,
                                            "thumb": $scope.mediaThumb,
                                            "type": $scope.mediaType,
                                            "caption": $scope.tweetText,
                                            "userScreenName": $scope.userScreenName,
                                            "userProfileImage": $scope.userProfileImage,
                                            "tweetCreatedAt": $scope.tweetCreatedAt
                                        };
                                        $scope.mediaQueue.push($scope.mediaVideoObject);

                                    }
                                }
                            }

                        } else {
                            $scope.tweetMedia = $scope.tweet.extended_media_entities[i].media_urlhttps;
                            var duplicatedMedia = false;
                            for (var key in $scope.mediaQueue) {
                                if ($scope.tweetMedia == $scope.mediaQueue[key].url) {
                                    duplicatedMedia = true;
                                    break;
                                } else {
                                    duplicatedMedia = false;
                                }
                            }
                            if (!duplicatedMedia) {
                                $scope.mediaImageObject = {
                                    "url": $scope.tweetMedia,
                                    "thumb": $scope.mediaThumb,
                                    "type": $scope.mediaType,
                                    "caption": $scope.tweetText,
                                    "userScreenName": $scope.userScreenName,
                                    "userProfileImage": $scope.userProfileImage,
                                    "tweetCreatedAt": $scope.tweetCreatedAt,
                                    "index" : $scope.mediaQueue.length
                                };
                                $scope.mediaQueue.push($scope.mediaImageObject);

                            }
                        }
                    }

                    $scope.totalMediaCount++;
                }

                $scope.$apply(function () {
                    $scope.lastNewTweets.push($scope.tweet);
                    $(".loading").hide();
                }, false);

            });

            source.addEventListener('tweets-over-time', function (response) {
                $scope.data = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.drawChart($scope.data);
                }, false);
            });

            source.addEventListener('top-people', function (response) {
                $scope.data = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.topPeople = $scope.data.topUsers;
                }, false);
            });

            source.addEventListener('country-update', function (response) {
                $scope.topCountrey = JSON.parse(response.data);
                $scope.countryName = ISO3166.getCountryName($scope.topCountrey.code);
                $scope.$apply(function () {
                    var countryUpdated = false;
                    for (var i = 0; i < $scope.topCountries.length; i++) {
                        if (locationChart.data[i][0] == $scope.countryName) {
                            locationChart.data[i][1] = $scope.topCountrey.count;
                            $scope.topCountries[i - 1].count = $scope.topCountrey.count;
                            countryUpdated = true;
                            break;
                        }
                    }

                    if (!countryUpdated) {
                        locationChart.data.push([$scope.countryName, $scope.topCountrey.count]);
                        $scope.topCountries.push($scope.topCountrey);
                    }

                    $scope.topCountriesLength = $scope.topCountries.length;

                }, false);
            });

        }

        $scope.startEventSource();

        var locationChart = {};
        $scope.locationChart = locationChart;

        $scope.drawLocationChart = function () {

            locationChart.type = "GeoChart";
            locationChart.data = [['Locale', 'Count']];

            locationChart.options = {
                tooltip: {
                    textStyle: {
                        color: '#191919'
                    },
                    showColorCode: true
                },
                height: 250,
                colorAxis: {
                    colors: ['#deebf7', '#9ecae1', '#3182bd']
                },
                displayMode: 'regions'
            };

        }

        // GET : the last stats of top countries
        $rootScope.getLocationStats = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topCountries';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    // MAP
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.countryName = ISO3166.getCountryName(response.items[i].code);
                        $scope.countryCount = response.items[i].count;

                        locationChart.data.push([$scope.countryName, $scope.countryCount]);
                        $scope.topCountries.push({
                            code: $scope.countryName,
                            count: $scope.countryCount
                        });
                    }
                }).error(function () {
                    console.log("#");
                })
        }

        $rootScope.getLocationStats();
        $scope.drawLocationChart();

        $scope.pagesShown = 1;
        $scope.pageSize = 10;

        $scope.tweetsShowned = 0;

        // Tweet queue limit
        $scope.tweetsQueueLimit = function () {
            $scope.tweetsShowned = $scope.pageSize * $scope.pagesShown;
            return $scope.pageSize * $scope.pagesShown;
        };

        // Show load more button
        $scope.loadMoreButton = function () {
            $scope.remainingTweetsCount = $scope.lastNewTweets.length;
            $scope.tweetsShowned = $scope.pageSize * $scope.pagesShown;
            if ($scope.showLoadMore && $scope.lastNewTweets.length != 0) {
                return true;
            }
        }

        $scope.loadMoreMediaButton = function () {
                return $scope.pagesShown < ($scope.mediaQueue.length / $scope.pageSize);
            }
            // Load more tweets handler
        $scope.loadMoreMedia = function () {
            $scope.pagesShown++;
        };

        // Load more tweets handler
        $scope.loadMoreTweets = function () {
            if ($scope.lastNewTweets.length <= 25) {
                $scope.tweetsQueue = $scope.tweetsQueue.concat($scope.lastNewTweets);
                $scope.pagesShown = $scope.pagesShown + $scope.lastNewTweets.length % $scope.pageSize;
            } else {
                $scope.tweetsHistory = $scope.tweetsHistory.concat($scope.tweetsQueue);
                var queueLength = $scope.tweetsQueue.length;
                for (var i = 0; i < $scope.lastNewTweets.length; i++) {
                    if (i < $scope.pageSize) {
                        $scope.tweetsQueue.push($scope.lastNewTweets[$scope.lastNewTweets.length - i - 1]);
                    } else {
                        $scope.tweetsHistory.push($scope.lastNewTweets[$scope.lastNewTweets.length - i - 1]);
                    }
                }
                $scope.tweetsQueue.splice(0, queueLength);
            }
            $scope.lastNewTweets = [];

            $scope.remainingTweetsCount = $scope.tweetsQueueLength - ($scope.pageSize * $scope.pagesShown);
        };

        $scope.loadMoreButtonFromHistory = function () {
            return $scope.tweetsHistory.length > 0;
        }

        $scope.loadMoreTweetsFromHistory = function () {
            $scope.loadTweetsFromHistoryArray = [];
            for (var i = 0; i < $scope.pageSize && $scope.tweetsHistory.length > i; i++) {
                $scope.loadTweetsFromHistoryArray.push($scope.tweetsHistory[$scope.tweetsHistory.length - i - 1]);
            }
            $scope.tweetsQueue = $scope.tweetsQueue.concat($scope.loadTweetsFromHistoryArray);
            $scope.tweetsHistory.splice($scope.tweetsHistory.length - $scope.pageSize, $scope.pageSize);
        }

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
                        $state.transitionTo('home');
                        SweetAlert.swal("Deleted!", "Your event has been deleted.", "success");
                    } else {
                        SweetAlert.swal("Cancelled", "Your event is in safe :)", "error");
                    }
                });
        };

        $scope.openLightboxModal = function (index) {
            Lightbox.openModal($scope.mediaQueue, index);
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
                        $cookieStore.remove("userAuthentication");
                        $scope.stopEventHandler();
                        $state.transitionTo('home');
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
                    CreateEventSource.closeEventSource();
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