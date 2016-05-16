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

        // 1. Set the initializing values
        $scope.dashboardState = false;
        if ($state.current.name == "dashboard.liveStreaming" || $state.current.name == "dashboard.media" || $state.current.name == "dashboard.map") {
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

        // Intialize


        $scope.initDashboardData = function () {
            User.setUserAuth();
            if (User.getUserAuth()) {
                $scope.getWarmupData();
                $scope.getViewOptions();
                $scope.getEventStats();
                User.getUserData();
                $scope.getLanguagesStats();
                $scope.drawlanguagesPieChart();
                $scope.getLocationStats();
                $scope.drawLocationGeoChart();
                $scope.drawLocationPieChart();
                $scope.getTopHashtags();
                $scope.getTopSources();
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

        $scope.downloadPdfReport = function () {

            var doc = new jsPDF(/*'landscape'*/), 
                      marginLeft = 10, marginTop = 15, 
                      lineHeight = 5,
                      padding = 5,
                      logoWidth = 30, logoHeight = 30,
                      pageWidth = 200,
                      imgeType = 'JPEG'
                      panelIds = ['tweets-per-country-panel' ,'tweets-overtime-panel', 'languages-panel', 'tweets-location-panel' , 'tweets-sources-panel'/*, 'media-panel', 'top-people-panel', 'hashtags-cloud-panel'*/],

                      reportName = 'Hashtag-analyzer Report.pdf',
                      keywordsIncluded = 'keywordsIncluded',
                      reportEmails = 'emailIds@mail.com',
                      reportMonitor = 'reportMonitor',
                      reportTime = 'reportTime',
                      reportCreator = 'reportCreator',
                      reportFrequency = 'reportFrequency',

                      callCount = 0,                             
                      canvas = document.createElement('canvas'),
                      ctx = canvas.getContext('2d'),
                      logoData = 'data:image/png;base64,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';

            
            doc.addImage(logoData, 'PNG', marginLeft, marginTop/4, logoWidth, logoHeight);

            doc.setFontSize(18);
            doc.text(marginLeft + logoWidth + padding, marginTop, "REPORT FOR '{0}' KEYWORDS.".replace('{0}', $rootScope.eventHashtag));

            doc.setFontSize(10);
            doc.text(marginLeft + logoWidth + padding, (marginTop += lineHeight), 'Report created for monitor: ' + reportMonitor + ' at: ' + reportTime + ' by: ' + reportCreator + ' on ' + reportFrequency + ' basis.');
            doc.text(marginLeft + logoWidth + padding, (marginTop += lineHeight), 'Keywords included: ' + keywordsIncluded);
            doc.text(marginLeft + logoWidth + padding, (marginTop += lineHeight), 'Receipents: ' + reportEmails);

            // Report first page.
            doc.line(marginLeft, (marginTop += lineHeight), pageWidth, marginTop); // horizontal line

 
            doc.text(marginLeft, (marginTop += lineHeight), 'TWEETS Statistics');

            angular.forEach(panelIds, function(value, index) {

                // Cloning fails when getting an element by class.
                var element = document.getElementById(value); 

                if (element != null) {

                    // Track how many async calls have been started. 
                    callCount += 1;         

                    domtoimage.toPng(element)
                        .then(function (dataUrl) {

                            var img = new Image();
                            img.src = dataUrl;

                            var imgSize = {
                                width: 320,
                                height: 200,
                            };

                            canvas.width = imgSize.width;
                            canvas.height = imgSize.height;

                            ctx.drawImage(img, 0, 0, imgSize.width, imgSize.height);

                            document.body.appendChild(canvas);                            
                            doc.addImage(canvas.toDataURL("image/jpeg"), imgeType, marginLeft + pageWidth*0.53, marginTop+2);
                            marginTop += 49;

                            console.log(padding);

                            // Track how many async calls have been completed. 
                            callCount -= 1;

                            // Last image rendered async.
                            if (callCount <= 0) {
                                doc.save(reportName);
                            }                            
                        })
                        .catch(function (error) {
                            console.error('ERROR: PDF conversion failed!', error);
                        });
                }
            });

            // function addImages(doc, images, x, y) {
            //     for (var i = 0; i < images.length; i++) {
            //         marginTop += 100 + padding;
            //         doc.addImage(images[i], imgeType, x, marginTop);
            //     }
            //     doc.save(reportName);
            // }

            // function getTopElement(element, topLimit) {
            //     var element = angular.element(element).copy();
            //     element.content = '';
            //     var children = [];

            //     for (var i = 0; i < Math.min(element.children().length, topLimit); i++) {
            //         children.push(element.children()[i]);
            //     }
            //     element.content = children;
            // }
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
        $scope.tweet = {};


        // Close event source if he leave the media or tweet stream stats
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                if (!(toState.name == "dashboard.liveStreaming" || toState.name == "dashboard.media" || toState.name == "dashboard.map")) {
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
                $scope.chartSeries = [{
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

            drawTweetsSourcesChart();

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

        // Logout User
        $scope.logOutUser = function () {
            User.userSignOut();
            $state.transitionTo('home');
        };

    });
