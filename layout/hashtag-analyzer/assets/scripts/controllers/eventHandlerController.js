var EventHandlerController = angular.module('EventHandlerController', []);

// Controller : Populate the recieved data and update Dashboard
EventHandlerController.controller('EventMainController', ['$rootScope',
                                   '$scope',
                                   '$http',
                                   '$location',
                                   '$window',
                                   '$anchorScroll',
                                   '$state',
                                   'RequestData',
                                   'CreateEventSource',
                                   '$timeout',
                                   'SweetAlert',
                                   'ISO3166',
                                   'Lightbox',
                                   '$modal',
                                   '$sce',
                                   '$cookies',
                                   '$cookieStore',
                                   'languageCode',
                                   'User',
                                   'filterHashtags',
                                   function ($rootScope, $scope, $http, $location, $window, $anchorScroll, $state, RequestData, CreateEventSource, $timeout, SweetAlert, ISO3166, Lightbox, $modal, $sce, $cookies, $cookieStore, languageCode, User, filterHashtags) {



        // 1. Set the initializing values
        // 2. Event streaming
        // 3. Draw charts and panels 
        // 4. Stop and kill event


        $scope.dashboardState = false;
        if ($state.current.name == "dashboard.liveStreaming" || $state.current.name == "dashboard.media" || $state.current.name == "dashboard.map") {
            $scope.dashboardState = true;
        }

        $scope.isActive = function (currentState) {
            return currentState === $state.current.name;
        };

        // Search from the dashboard
        $scope.dashboardSearch = function () {
            var eventHashtag = $('#eventHashtag').val();
            var validSearch = true;
            if (eventHashtag === undefined) {
                validSearch = false;
                $(".search-error").css("display", "inline-block");
                $(".search-error").text("Please type at least three letters to start your event");
            }
            var checkHashtag = filterHashtags.preventBadHashtags(eventHashtag);
            if (checkHashtag) {
                validSearch = false;
                $(".search-error").css("display", "inline-block");
                $(".search-error").text("We prevent searching for sexual hashtags .. choose other hashtag");
            }
            if (validSearch) {

                SweetAlert.swal({
                        title: "Are you sure?",
                        text: "if you start new event, you can come back to current one from the homepage",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, Start it!",
                        closeOnConfirm: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            $scope.stopEventHandler();
                            SweetAlert.swal("Deleted!", "Your event has been deleted.", "success");

                            $scope.startNewEvent = function (action) {

                                // Check if there is an authentication key in the browser cookies
                                if (User.getUserAuth()) {
                                    $scope.$broadcast();
                                    RequestData.startEvent('POST', eventHashtag)
                                        .success(function (response) {
                                            $rootScope.eventID = response.uuid;
                                            // Redirect the front website page to the admin page
                                            $state.transitionTo('dashboard.liveStreaming', {
                                                uuid: $scope.eventID
                                            });

                                            $scope.initDashboardData();
                                        })
                                } else {
                                    var requestAction = "GET";
                                    var apiUrl = '/api/events/login/twitter?hashtags=' + $scope.eventHashtag;
                                    var requestData = ""
                                    RequestData.fetchData(requestAction, apiUrl, requestData)
                                        .then(function (response) {
                                            var openUrl = response.data.url;
                                            $window.location.href = openUrl;
                                        });
                                }
                            };

                            $scope.startNewEvent();

                        } else {
                            SweetAlert.swal("Cancelled", "Your event is in safe :)", "error");
                        }
                    });
            }

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
                        $(".loading").hide();
                    }
                }).error(function () {
                    console.log("#");
                })
        };

        // Intialize
        $scope.initDashboardData = function () {
            User.setUserAuth();
            $scope.getWarmupData();
            $scope.getViewOptions();
            $scope.getEventStats();
            User.getUserData();
        }


        $scope.dynamicPopover = {
            templateUrl: 'myPopoverTemplate.html'
        };

        // SET : Event UUID, userAuthentication, Hashtags, Username, Profile images, User ID
        $rootScope.eventID = $location.search().uuid;
        $rootScope.authoUserName = $location.search().screenName;

        if ($cookies.userAuthentication === undefined || $cookies.userAuthentication === "undefined") {
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
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topTweets?authToken=' + $cookies.userAuthentication;
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.tweet = JSON.parse(response.items[i]);
                        $scope.topTweets.push($scope.tweet);
                        $scope.topTweets.sort(function (a, b) {
                            return (b.score) - (a.score);
                        });
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
                if (toState.name == "dashboard.liveStreaming" || toState.name == "dashboard.media") {} else {
                    CreateEventSource.closeEventSource();
                }
            })

        // DRAW MAP
        $scope.tweetsLocation = [];
        $scope.map = {
            center: {
                latitude: 45,
                longitude: -73
            },
            zoom: 2
        };
        $scope.mapOptions = {
            scrollwheel: false
        };

        $scope.windowOptions = {
            visible: false
        };

        $scope.onClick = function () {
            $scope.windowOptions.visible = !$scope.windowOptions.visible;
        };

        $scope.closeClick = function () {
            $scope.windowOptions.visible = false;
        };

        // Listen to new message

        $scope.startEventSource = function () {

            $scope.eventSourceUrl = $rootScope.baseUrl + "/api/liveTweets?uuid=" + $rootScope.eventID;

            var source = CreateEventSource.createSource($scope.eventSourceUrl);

            source.addEventListener('approved-tweets', function (response) {

                $scope.tweet = JSON.parse(response.data);
                $scope.tweetID = $scope.tweet.id_str;

                // Update Geo location map
                if ($scope.tweet.geo_location != null) {

                    $scope.tweetGeoLocation = $scope.tweet.geo_location;
                    $scope.tweetGeoLocationLatitude = $scope.tweet.geo_location.latitude;
                    $scope.tweetGeoLocationLongitude = $scope.tweet.geo_location.longitude;
                    $scope.tweetMarkerID = $scope.tweetsLocation.length;

                    $scope.tweetsLocation.push({
                        id: $scope.tweetMarkerID,
                        latitude: $scope.tweetGeoLocationLatitude,
                        longitude: $scope.tweetGeoLocationLongitude,
                        show: false,
                        tweetText: $scope.tweet.text,
                        tweetUser: $scope.tweet.user.screen_name,
                        tweetUserPicture: $scope.tweet.user.original_profile_image_urlhttps
                    });

                }

                // Update languages pie chart
                $scope.languageName = languageCode.getLanguageName($scope.tweet.lang);
                var languageUpdated = false;

                if ($scope.languageName != undefined) {
                    for (var i = 0; i < languagesPieChart.data.length; i++) {
                        if (languagesPieChart.data[i][0] == $scope.languageName) {
                            languagesPieChart.data[i][1] ++;
                            languageUpdated = true;
                            break;
                        }
                    }
                    if (!languageUpdated) {
                        languagesPieChart.data.push([$scope.languageName, 1]);
                    }
                }

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
                            console.log($scope.mediaType);
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
                                        $scope.totalMediaCount++;

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
                                    "index": $scope.mediaQueue.length
                                };
                                $scope.mediaQueue.push($scope.mediaImageObject);
                                $scope.totalMediaCount++;

                            }
                        }
                    }

                }

                $scope.$apply(function () {
                    if ($scope.tweetsQueue.length >= 25) {
                        $scope.lastNewTweets.push($scope.tweet);
                    } else {
                        $scope.tweetsQueue.unshift($scope.tweet);
                    }

                    $(".loading").hide();
                }, false);

                $scope.totalTweetsCount++;

            });

            // Tweets overtime
            source.addEventListener('tweets-over-time', function (response) {
                $scope.data = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.drawChart($scope.data);
                }, false);
            });

            // Top active people
            source.addEventListener('top-people', function (response) {
                $scope.data = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.topPeople = $scope.data.topUsers;
                }, false);
            });
            
            // Top country
            source.addEventListener('country-update', function (response) {
                $scope.topCountrey = JSON.parse(response.data);

                $scope.countryName = ISO3166.getCountryName($scope.topCountrey.code);
                $scope.countryCount = $scope.topCountrey.count;
                var countryUpdated = false;

                $scope.$apply(function () {
                    if ($scope.topCountries.length != 0) {
                        for (var i = 0; i < $scope.topCountries.length; i++) {
                            if (locationChart.data[i][0] == $scope.countryName) {
                                locationChart.data[i][1] = $scope.topCountrey.count;
                                $scope.topCountries[i - 1].count = $scope.topCountrey.count;
                                countryUpdated = true;
                                break;
                            }
                        }
                    }

                    if (!countryUpdated) {
                        locationChart.data.push([$scope.countryName, $scope.topCountrey.count]);
                        $scope.topCountries.push({
                            code: $scope.countryName,
                            count: $scope.countryCount
                        });
                    }

                    $scope.topCountriesLength = $scope.topCountries.length;

                }, false);
            });

        }

        $scope.startEventSource();

        var locationChart = [];
        $scope.locationChart = locationChart;

        $scope.drawLocationGeoChart = function () {

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

        var locationPieChart = [];
        $scope.locationPieChart = locationPieChart;

        $scope.drawLocationPieChart = function () {

            locationPieChart.type = "PieChart";
            locationPieChart.data = locationChart.data;

            locationPieChart.options = {
                displayExactValues: true,
                is3D: true,
                chartArea: {
                    left: 10,
                    top: 0,
                    width: '100%',
                    height: '100%'
                }
            };
        }

        var languagesPieChart = [];
        $scope.languagesPieChart = languagesPieChart;

        $scope.drawlanguagesPieChart = function () {

            languagesPieChart.type = "PieChart";
            languagesPieChart.data = [['Language', 'Count']];

            languagesPieChart.options = {
                displayExactValues: true,
                is3D: true,
                chartArea: {
                    left: 10,
                    top: 0,
                    width: '100%',
                    height: '100%'
                }
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
        $scope.drawLocationGeoChart();
        $scope.drawLocationPieChart();

        // GET : the last stats of top countries
        $rootScope.getLanguagesStats = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topLanguages';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.languageName = languageCode.getLanguageName(response.items[i].code);
                        $scope.languageCount = response.items[i].count;
                        if (response.items[i].code != "und" && $scope.languageName != undefined) {
                            languagesPieChart.data.push([$scope.languageName, $scope.languageCount]);
                        }
                    }

                }).error(function () {
                    console.log("#");
                })
        }

        $rootScope.getLanguagesStats();
        $scope.drawlanguagesPieChart();


        // GET : 
        $scope.getTopWords = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topWords';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {}).error(function () {
                    console.log("#");
                })
        }
        $scope.getTopWords();

        // GET : 
        $scope.topHashtags = [];
        $scope.tagCloudColors = ['rgb(222,235,247)', 'rgb(158,202,225)', 'rgb(49,130,189)'];

        $scope.getTopHashtags = function () {

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topHashtags';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.hashtagWeight = response.items[i].count;
                        $scope.hashtagText = response.items[i].code;
                        $scope.topHashtags.push({
                            "text": $scope.hashtagText,
                            "weight": $scope.hashtagWeight,
                            "link": $rootScope.twitterBaseUrl + "search?q=" + $scope.hashtagText
                        });
                    }
                }).error(function () {
                    console.log("#");
                })
        }
        $scope.getTopHashtags();


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
                $scope.tweetsQueue = $scope.lastNewTweets.concat($scope.tweetsQueue);
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
            $scope.eventStarted = false;
            CreateEventSource.closeEventSource();
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
                            enabled: true,
                            style: {
                                color: '#d5d5d5',
                                font: '10px Trebuchet MS, Verdana, sans-serif'
                            }
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