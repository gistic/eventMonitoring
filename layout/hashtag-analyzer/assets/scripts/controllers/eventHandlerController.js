var EventHandlerController = angular.module('EventHandlerController', [
    'highcharts-ng',
    'iso-3166-country-codes',
    'iso-language-codes',
    'googlechart',
    'bootstrapLightbox',
    'uiGmapgoogle-maps',
    'wu.masonry',
    'angular-images-loaded',
    'angular-jqcloud',
    'angularMoment',
    'infinite-scroll',
    'me-lazyload'
]);

// Controller : Populate the recieved data and update Dashboard
EventHandlerController.controller('EventMainController',
    function ($rootScope, $scope, $http, $location, $window, $anchorScroll, $state, RequestData, CreateEventSource, $timeout, SweetAlert, SweetAlertFactory, ISO3166, Lightbox, $modal, $sce, $cookies, $cookieStore, languageCode, User, filterHashtags) {

        $scope.countryAbbrev = {
            "eg": "مصر",
            "gb": "بريطانيا",
            "us": "الولايات المتحدة",
            "fr": "فرنسا",
            "sa": "السعودية",
            "qa": "قطر"
        }

        // 1. Set the initializing values
        $scope.dashboardState = false;
        if ($state.current.name == "dashboard.liveStreaming" || $state.current.name == "dashboard.media" || $state.current.name == "dashboard.news" || $state.current.name == "dashboard.facebook" || $state.current.name == "dashboard.map") {
            $scope.dashboardState = true;
        }
        // Lightbox for media
        $scope.Lightbox = Lightbox;
        $scope.openLightboxModal = function (index) {
            Lightbox.openModal($scope.mediaQueue, index);
        };

        // SET : Event UUID, userAuthentication, Hashtags, Username, Profile images, User ID
        $rootScope.eventID = $location.search().uuid;

        $scope.isActive = function (currentState) {
            return currentState === $state.current.name;
        };

        $scope.eventsLimitExceeded = false;
        $scope.getEvents = function () {
            $scope.eventDataChunk = "Trending Events";
            var requestAction = "GET";
            var apiUrl = '/api/events/runningEvents?authToken=' + $cookies.userAuthentication;
            var requestData = ""
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    // Running User Events
                    $scope.runningUserEvents = response.data.runningUserEvents;
                    for (var i = 0; i < $scope.runningUserEvents.length; i++) {
                        var eventHashtag = $scope.runningUserEvents[i].hashtags;
                        $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                        $scope.runningUserEvents[i].hashtags = $scope.serverEventHashtag;
                    }
                    if ($scope.runningUserEvents.length == 3) {
                        $scope.eventsLimitExceeded = true;
                    }
                });
        }


        // Search from the dashboard
        $scope.dashboardSearch = function () {

            // $scope.hashtagBeforeSearch = $scope.eventHashtag;
            $rootScope.eventHashtag = $('#eventHashtag').val();
            eventHashtag = $rootScope.eventHashtag;

            // Check hashtag
            var checkHashtag = filterHashtags.preventBadHashtags(eventHashtag);
            if (checkHashtag) {
                $rootScope.searchError = true;
                $(".search-error").text(checkHashtag);
            } else {

                var sameEventIsRunning = false;
                for (var i = 0; i < $scope.runningUserEvents.length; i++) {
                    if ($scope.runningUserEvents[i].hashtags.toLowerCase() === eventHashtag.toLowerCase()) {
                        var sameEventIsRunning = true;
                        $scope.runningEventID = $scope.runningUserEvents[i].uuid;
                    }
                }

                if (sameEventIsRunning) {
                    // Redirect the front website page to the admin page
                    $state.transitionTo('dashboard.liveStreaming', {
                        uuid: $scope.runningEventID
                    });
                } else if ($scope.eventsLimitExceeded) {
                    var alertText = "You have reached the max. number of active events .. by starting a new one we will close your first event";
                    var alertConfirmButtonText = "Yes, stop it!";
                    SweetAlertFactory.showSweetAlert(alertText, alertConfirmButtonText);
                } else {
                    var alertText = "if you start new event, you can come back to current one from the homepage";
                    var alertConfirmButtonText = "Yes, Start it!";
                    SweetAlertFactory.showSweetAlert(alertText, alertConfirmButtonText);
                }
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
            $scope.eventDataChunk = "Event Statistics";
            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/basicStats';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.totalMediaCount = response.totalMedia;
                    $scope.totalUsersCount = response.numberOfUsers;
                    $scope.totalTweetsCount = response.totalTweets + response.totalRetweets;

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
            $scope.eventDataChunk = "Warm Up Tweets";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/cachedTweets';
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.tweet = JSON.parse(response.items[i]);
                        $scope.tweetsQueue.push($scope.tweet);
                    }
                    $rootScope.loadingEvent = false;
                }).error(function () {
                    $rootScope.loadingEvent = false;
                    console.log("#");
                })
        };

        $scope.getSavedNews = function () {
            // $scope.eventDataChunk = "Warm Up Tweets";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/savedNews';
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.$apply(function () {
                            $scope.newsQueue.push(JSON.parse(response.items[i]))
                            $scope.newsQueue.sort(function(a,b){
                                new_date = new Date(a.date)
                                old_date = new Date(b.date)
                                return old_date-new_date
                            });
                        });
                    }
                    $rootScope.loadingEvent = false;
                }).error(function () {
                    $rootScope.loadingEvent = false;
                    console.log("#");
                })
        };

        
        $scope.getSavedFbPosts = function () {
            // $scope.eventDataChunk = "Warm Up Tweets";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/savedFbPosts';
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.$apply(function () {
                            $scope.fbQueue.push(JSON.parse(response.items[i]))
                            $scope.fbQueue.sort(function(a,b){
                                new_date = new Date(a.date)
                                old_date = new Date(b.date)
                                return old_date-new_date
                            });
                        });
                    }
                    $rootScope.loadingEvent = false;
                }).error(function () {
                    $rootScope.loadingEvent = false;
                    console.log("#");
                })
        };

        // Intialize


        $scope.initDashboardData = function () {
            User.setUserAuth();
            if (User.getUserAuth()) {
                $scope.getWarmupData();
                $scope.getSavedNews();
                $scope.getSavedFbPosts();
                $scope.getViewOptions();
                $scope.getEventStats();
                User.getUserData();
                $scope.getLanguagesStats();
                $scope.drawlanguagesPieChart();
                $scope.getLocationStats();
                $scope.getNewsLocationStats();
                $scope.drawLocationGeoChart();
                $scope.drawLocationPieChart();
                $scope.drawNewsLocationGeoChart();
                $scope.drawNewsLocationPieChart();
                $scope.getTopHashtags();
                $scope.getTopSources();
                $scope.getTopNewsSources();
                $scope.getEvents();
            } else {
                $state.transitionTo('home');
            }
        }

        // TOP TWEETS
        $scope.topTweets = [];
        $scope.getTopTweets = function () {
            $scope.eventDataChunk = "Top Tweets";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topTweets?authToken=' + $cookies.userAuthentication;
            var requestAction = "GET";
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.topTweets = [];
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.tweet = JSON.parse(response.items[i]);
                        $scope.topTweets.push($scope.tweet);
                        $scope.topTweets.sort(function (a, b) {
                            return (b.score) - (a.score);
                        });
                    }
                    $scope.loading = false;
                }).error(function () {
                    console.log("#");
                })
        };

        $scope.showLoadMore = true;
        $scope.showLoadMoreButton = function () {
            $scope.showLoadMore = true;
            $scope.loadMoreButton();
            $scope.showTotalTweetsNumber = true;
        }

        $scope.loadMostPopular = function () {
            $scope.showLoadMore = false;
            $scope.showTotalTweetsNumber = false;
            $scope.loading = true;
            $scope.getTopTweets();
        }

        // Start New Event Handler
        $scope.tweetsQueue = []; // display
        $scope.lastNewTweets = []; // for button
        $scope.tweetsHistory = []; // history
        $scope.loadTweetsFromHistoryArray = [];
        $scope.tweetsQueueLength = 0;
        $scope.lastNewTweetsLength = 0;
        $scope.mediaQueue = [];
        $scope.lastNewMedia = [];
        $scope.topPeople = [];
        $scope.newsQueue = [];
        $scope.fbQueue = [];
        $scope.tweet = {};


        // Close event source if he leave the media or tweet stream stats
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                if (!(toState.name == "dashboard.liveStreaming" || toState.name == "dashboard.media" || toState.name == "dashboard.news" || toState.name == "dashboard.facebook" || toState.name == "dashboard.map")) {

                    CreateEventSource.closeEventSource();
                }
            })

        // DRAW Google MAP
        $scope.tweetsLocation = [];
        $scope.defaultMapOnError = {
            center: {
                latitude: 36.03133178,
                longitude: 16.5234375
            },
            zoom: 2

        }

        if (!!navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.map = {
                    center: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    },
                    zoom: 6
                }

                $scope.userPositionMarker = {
                    id: 0,
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                }
            }, function () {
                $scope.map = $scope.defaultMapOnError;
            });

        } else {
            $(".angular-google-map-container").innerHTML = 'No Geolocation Support.';
            $scope.map = $scope.defaultMapOnError;
        }

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
                $scope.eventDataChunk = "Live Streaming";
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

                // Update tweets sources
                var sourceUpdated = false;
                if ($scope.tweet.source != null) {
                    var tweetSource = $scope.tweet.source;
                    $scope.sourceName = tweetSource.substring(tweetSource.indexOf(">") + 1, tweetSource.lastIndexOf("<"));
                    $scope.sourceName = $scope.sourceName.substring($scope.sourceName.indexOf(">"));

                    for (var i = 0; i < $scope.topSource.length; i++) {
                        if ($scope.topSource[i].code == $scope.sourceName) {
                            $scope.topSource[i].count++;
                            sourceUpdated = true;
                            $scope.topSource.sort(function (a, b) {
                                return (b.count) - (a.count);
                            });
                            $scope.drawTweetsSourcesChart($scope.topSource);
                            break;
                        }
                    }
                    if (!sourceUpdated) {
                        $scope.topSource.push({
                            code: $scope.sourceName,
                            count: 1
                        });
                        $scope.topSource.sort(function (a, b) {
                            return (b.count) - (a.count);
                        });

                        $scope.drawTweetsSourcesChart($scope.topSource);
                    }

                }

                // Update languages pie chart
                $scope.languageName = languageCode.getLanguageName($scope.tweet.lang);
                var languageUpdated = false;

                if ($scope.languageName != undefined) {
                    for (var i = 0; i < languagesPieChart.data.length; i++) {
                        if (languagesPieChart.data[i][0] == $scope.languageName) {
                            languagesPieChart.data[i][1]++;
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
                    $scope.tweetIdStr = $scope.tweet.id_str;


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
                                            "tweetIdStr": $scope.tweetIdStr,
                                            "tweetCreatedAt": $scope.tweetCreatedAt,
                                            "index": $scope.mediaQueue.length
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
                                    "tweetIdStr": $scope.tweetIdStr,
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

            // News Item
            source.addEventListener('news-item', function (response) {
                console.log("got news item");
                var newsItem = JSON.parse(response.data);

                // Update tweets sources
                var sourceUpdated = false;
                if (newsItem.source != null) {
                    console.log("got news source!");
                    var newsSourceName = newsItem.source;
                    console.log(newsItem.source);
                    for (var i = 0; i < $scope.topNewsSource.length; i++) {
                        if ($scope.topNewsSource[i].code == newsSourceName) {
                            $scope.topNewsSource[i].count++;
                            sourceUpdated = true;
                            $scope.topNewsSource.sort(function (a, b) {
                                return (b.count) - (a.count);
                            });
                            $scope.drawNewsSourcesChart($scope.topNewsSource);
                            break;
                        }
                    }
                    if (!sourceUpdated) {
                        $scope.topNewsSource.push({
                            code: newsSourceName,
                            count: 1
                        });
                        $scope.topNewsSource.sort(function (a, b) {
                            return (b.count) - (a.count);
                        });

                        $scope.drawNewsSourcesChart($scope.topNewsSource);
                    }
                }

                //Update country

                $scope.newsTopCountry = newsItem.country.toUpperCase();

                $scope.countryName = ISO3166.getCountryName($scope.newsTopCountry);
                $scope.countryCount = 1;//$scope.topCountrey.count;
                var countryUpdated = false;

                $scope.$apply(function () {
                    if (newsLocationChart.data.length != 0) {
                        for (var i = 0; i < newsLocationChart.data.length; i++) {
                            if (newsLocationChart.data[i][0] == $scope.countryName) {
                                newsLocationChart.data[i][1] = newsLocationChart.data[i][1]+1;
                                countryUpdated = true;
                                break;
                            }
                        }
                    }

                    if (!countryUpdated) {
                        newsLocationChart.data.push([$scope.countryName, $scope.countryCount]);
                        $scope.topNewsCountriesLength++;
                    }

                }, false);


                // Update news queue
                $scope.$apply(function () {
                    $scope.newsQueue.push(newsItem)
                    $scope.newsQueue.sort(function(a,b){
                        new_date = new Date(a.date)
                        old_date = new Date(b.date)
                        return old_date-new_date
                    });
                });
            });

            // Facebook post
            source.addEventListener('fb-post', function (response) {
                var fbPost = JSON.parse(response.data);

                // Update facebook sources
                var sourceUpdated = false;
                if (fbPost.source != null) {
                    //console.log("got news source!");
                    var facebookSourceName = fbPost.source;
                    //console.log(newsItem.source);
                    for (var i = 0; i < $scope.topFacebookSource.length; i++) {
                        if ($scope.topFacebookSource[i].code == facebookSourceName) {
                            $scope.topFacebookSource[i].count++;
                            sourceUpdated = true;
                            $scope.topFacebookSource.sort(function (a, b) {
                                return (b.count) - (a.count);
                            });
                            $scope.drawFacebookSourcesChart($scope.topFacebookSource);
                            break;
                        }
                    }
                    if (!sourceUpdated) {
                        $scope.topFacebookSource.push({
                            code: facebookSourceName,
                            count: 1
                        });
                        $scope.topFacebookSource.sort(function (a, b) {
                            return (b.count) - (a.count);
                        });

                        $scope.drawFacebookSourcesChart($scope.topFacebookSource);
                    }
                }

                // Update facebook posts queue
                $scope.$apply(function () {
                    $scope.fbQueue.push(fbPost)
                    $scope.fbQueue.sort(function(a,b){
                        new_date = new Date(a.date)
                        old_date = new Date(b.date)
                        return old_date-new_date
                    });
                });
            });

            // Top country
            source.addEventListener('country-update', function (response) {
                $scope.topCountrey = JSON.parse(response.data);

                $scope.countryName = ISO3166.getCountryName($scope.topCountrey.code);
                $scope.countryCount = $scope.topCountrey.count;
                var countryUpdated = false;

                $scope.$apply(function () {
                    if (locationChart.data.length != 0) {
                        for (var i = 0; i < locationChart.data.length; i++) {
                            if (locationChart.data[i][0] == $scope.countryName) {
                                locationChart.data[i][1] = $scope.countryCount;
                                countryUpdated = true;
                                break;
                            }
                        }
                    }

                    if (!countryUpdated) {
                        locationChart.data.push([$scope.countryName, $scope.countryCount]);
                        $scope.topCountriesLength++;
                    }

                }, false);
            });
        }
        $scope.startEventSource();

        // Languages Pie Chart
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

        // News location map visualization
        var newsLocationChart = [];
        $scope.newsLocationChart = newsLocationChart;
        $scope.drawNewsLocationGeoChart = function () {

            newsLocationChart.type = "GeoChart";
            newsLocationChart.data = [['Country', 'News Count: ']];

            newsLocationChart.options = {
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

        var newsLocationPieChart = [];
        $scope.newsLocationPieChart = newsLocationPieChart;
        $scope.drawNewsLocationPieChart = function () {

            newsLocationPieChart.type = "PieChart";
            newsLocationPieChart.data = newsLocationChart.data;

            newsLocationPieChart.options = {
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

        // Location GEO Chart [ Location's Map ]
        var locationChart = [];
        $scope.locationChart = locationChart;
        $scope.drawLocationGeoChart = function () {

            locationChart.type = "GeoChart";
            locationChart.data = [['Country', 'Tweet Count: ']];

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

        // GET : the last stats of top countries
        $scope.getLocationStats = function () {
            $scope.eventDataChunk = "Locations & Countries";
            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topCountries';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    // Update Geo map & Pie chart
                    for (var i = 0; i < response.items.length; i++) {
                        $scope.countryName = ISO3166.getCountryName(response.items[i].code);
                        $scope.countryCount = response.items[i].count;
                        locationChart.data.push([$scope.countryName, $scope.countryCount]);
                    }
                    $scope.topCountriesLength = locationChart.data.length - 1
                }).error(function () {
                    console.log("#");
                })
        }

        // GET : the last stats of top news countries
        //var newsLocationChart = [];
        //$scope.newsLocationChart = newsLocationChart;
        $scope.getNewsLocationStats = function () {
            $scope.eventDataChunk = "Locations & Countries";
            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topNewsCountries';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    // Update Geo map & Pie chart
                    for (var i = 0; i < response.items.length; i++) {
                        var countryShortName = response.items[i].code.toString().toUpperCase();
                        console.log("country code : "+ countryShortName);
                        if (countryShortName === "KSA" || countryShortName === "SAU" || countryShortName === "") countryShortName = "SA";
                        if (countryShortName === "UK") countryShortName = "GB";
                            $scope.newsCountryName = ISO3166.getCountryName(countryShortName);
                        $scope.newsCountryCount = response.items[i].count;

                        newsLocationChart.data.push([$scope.newsCountryName, $scope.newsCountryCount]);
                    }
                    $scope.topNewsCountriesLength = newsLocationChart.data.length - 1
                }).error(function () {
                    console.log("#");
                })
        }

        // GET : the last stats of top languages
        $scope.getLanguagesStats = function () {
            $scope.eventDataChunk = "Languages";
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

        // GET : Top Hashtags
        $scope.topHashtags = [];
        $scope.tagCloudColors = ['rgb(49,130,189)', 'rgb(20,100,255)', 'rgb(158,202,225)'];

        $scope.getTopHashtags = function () {
            $scope.eventDataChunk = "Top Related Hashtags";
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

        $scope.topSource = [];
        $scope.getTopSources = function () {
            $scope.eventDataChunk = "Tweets Sources";
            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topSources';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.topSource = response.items;
                    $scope.drawTweetsSourcesChart($scope.topSource);
                }).error(function () {
                    console.log("#");
                })
        }

        // TODO GET : Top news sources
        $scope.topNewsSource = [];
        $scope.getTopNewsSources = function () {
            $scope.eventDataChunk = "News Sources";
            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/topNewsSources';
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $scope.topNewsSource = response.items;
                    $scope.drawNewsSourcesChart($scope.topNewsSource);
                }).error(function () {
                    console.log("#");
                })
        }

        // TODO GET : Top facebook sources
        $scope.topFacebookSource = [];
        // implement

        // Tweet queue logic
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



        // Draw tweets sources chart
        $scope.tweetsSourcesChartConfig = {
            options: {
                chart: {
                    type: 'column',
                    height: 250,
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                },
                title: {
                    text: ''
                }

            },
        };

        $scope.drawTweetsSourcesChart = function () {

            $scope.tweetsSources = [];

            function drawTweetsSourcesChart(data) {

                for (i = 0; i < $scope.topSource.length; i++) {
                    $scope.tweetsSourceName = $scope.topSource[i].code;
                    $scope.tweetsSourceCount = $scope.topSource[i].count;
                    $scope.tweetsSources.push({
                        name: $scope.tweetsSourceName,
                        y: $scope.tweetsSourceCount
                    });
                }
                var chartSeries = [{
                    "name": "Tweets count",
                    data: $scope.tweetsSources,
                    colorByPoint: true,
                    showInLegend: false,
                    "id": "tweetsChart",
                    color: "rgb(22, 123, 230)"
                }];
                $scope.tweetsSourcesChartConfig = {
                    options: {
                        chart: {
                            type: 'column',
                            animation: {
                                duration: 1500
                            },
                            height: 300,
                            backgroundColor: 'rgba(255, 255, 255, 0.01)'
                        }
                    },
                    xAxis: {
                        type: 'category',
                        gridLineWidth: 1,
                        gridLineColor: "rgb(245, 245, 245)",


                        labels: {
                            enabled: true,
                            rotation: -45,
                            style: {
                                color: '#d5d5d5',
                                font: '11px Trebuchet MS, Verdana, sans-serif'
                            }
                        }
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
                    series: chartSeries,
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

            drawTweetsSourcesChart();

        }

        // Draw news sources chart
        $scope.newsSourcesChartConfig = {
            options: {
                chart: {
                    type: 'column',
                    height: 250,
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                },
                title: {
                    text: ''
                }

            },
        };

        $scope.drawNewsSourcesChart = function () {

            var newsSources = [];

            function drawNewsSourcesChart(data) {

                for (i = 0; i < $scope.topNewsSource.length; i++) {
                    var newsSourceName = $scope.topNewsSource[i].code;
                    var newsSourceCount = $scope.topNewsSource[i].count;
                    newsSources.push({
                        name: newsSourceName,
                        y: newsSourceCount
                    });
                }
                var chartSeries = [{
                    "name": "News count",
                    data: newsSources,
                    colorByPoint: true,
                    showInLegend: false,
                    "id": "newsChart",
                    color: "rgb(22, 123, 230)"
                }];
                $scope.newsSourcesChartConfig = {
                    options: {
                        chart: {
                            type: 'column',
                            animation: {
                                duration: 1500
                            },
                            height: 300,
                            backgroundColor: 'rgba(255, 255, 255, 0.01)'
                        }
                    },
                    xAxis: {
                        type: 'category',
                        gridLineWidth: 1,
                        gridLineColor: "rgb(245, 245, 245)",


                        labels: {
                            enabled: true,
                            rotation: -45,
                            style: {
                                color: '#d5d5d5',
                                font: '11px Trebuchet MS, Verdana, sans-serif'
                            }
                        }
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
                    series: chartSeries,
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

            drawNewsSourcesChart();

        }

        $scope.drawFacebookSourcesChart = function () {

            var facebookSources = [];

            function drawFacebookSourcesChart(data) {

                for (i = 0; i < $scope.topFacebookSource.length; i++) {
                    var facebookSourceName = $scope.topFacebookSource[i].code;
                    var facebookSourceCount = $scope.topFacebookSource[i].count;
                    facebookSources.push({
                        name: facebookSourceName,
                        y: facebookSourceCount
                    });
                }
                var chartSeries = [{
                    "name": "Facebook source count",
                    data: facebookSources,
                    colorByPoint: true,
                    showInLegend: false,
                    "id": "facebookChart",
                    color: "rgb(22, 123, 230)"
                }];
                $scope.facebookSourcesChartConfig = {
                    options: {
                        chart: {
                            type: 'column',
                            animation: {
                                duration: 1500
                            },
                            height: 300,
                            backgroundColor: 'rgba(255, 255, 255, 0.01)'
                        }
                    },
                    xAxis: {
                        type: 'category',
                        gridLineWidth: 1,
                        gridLineColor: "rgb(245, 245, 245)",


                        labels: {
                            enabled: true,
                            rotation: -45,
                            style: {
                                color: '#d5d5d5',
                                font: '11px Trebuchet MS, Verdana, sans-serif'
                            }
                        }
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
                    series: chartSeries,
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

            drawFacebookSourcesChart();

        }

        // Draw Tweets overtime Chart
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

        $scope.drawChart = function (data) {

            function drawTweetsOverTimeChart() {
                var arrayLength = $scope.data.length;
                var tweetsCountArray = [];
                var tweetsTimeArray = [];

                $scope.totalTweets = 0;

                for (var i = 0; i < arrayLength; i++) {
                    tweetsCountArray[i] = $scope.data[i].tweets_count;
                    $scope.totalTweets += $scope.data[i].tweets_count;
                    var localTime = new Date(($scope.data[i].time));
                    var formatedTime = localTime.getHours() + ":" + localTime.getMinutes();
                    tweetsTimeArray[i] = formatedTime;
                }

                var chartSeries = [{
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
                    series: chartSeries,
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

        // Logout User
        $scope.logOutUser = function () {
            User.userSignOut();
            $state.transitionTo('home');
        };

    });
