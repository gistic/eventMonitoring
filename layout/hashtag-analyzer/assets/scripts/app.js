'use strict';

var trackHashtagApp = angular.module('trackHashtagApp', ['ui.router', 'myAppDirectives', 'myAppFilters', 'highcharts-ng', 'oitozero.ngSweetAlert']);


// Run : Intliaize the event admin app with this values
trackHashtagApp.run(function ($window, $location, $rootScope) {
    $rootScope.baseUrl = $window.location.origin;
    $rootScope.twitterBaseUrl = "http://www.twitter.com/";
    $rootScope.eventID = $location.search().uuid;
})

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
            templateUrl: 'views/views-components/live-streaming.html',
            controller: 'EventMainController'
        },
        "dashboard.media": {
            url: '/media',
            templateUrl: 'views/views-components/media.html',
            controller: 'EventMainController'
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
trackHashtagApp.filter('array', function() {
    return function(arrayLength) {
        arrayLength = Math.ceil(arrayLength);
        var arr = new Array(arrayLength), i = 0;
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
trackHashtagApp.factory('RequestData', ['$rootScope', '$http', '$location', '$window', function ($rootScope, $http, $location, $window) {

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
            var requestUrl = $rootScope.baseUrl + '/api/events';

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

/* Controller : Start new event */
trackHashtagApp.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', function ($rootScope, $scope, $http, $state, RequestData) {

    $scope.startNewEvent = function (action) {

        $scope.$broadcast();

        RequestData.startEvent()
            .success(function (response) {
                $rootScope.eventID = response.uuid;

                // Redirect the front website page to the admin page
                $state.transitionTo('dashboard.liveStreaming', {
                    uuid: $scope.eventID
                });
            })
    };
}]);


// Controller : Populate the recieved data and update admin page
trackHashtagApp.controller('EventMainController', ['$rootScope', '$scope', '$http', '$location', '$window', '$anchorScroll', '$state', 'RequestData', 'CreateEventSource', '$timeout', 'SweetAlert',
                                            function ($rootScope, $scope, $http, $location, $window, $anchorScroll, $state, RequestData, CreateEventSource, $timeout, SweetAlert) {

        $rootScope.eventID = $location.search().uuid;
        $scope.eventID = $location.search().uuid;

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
        $scope.mediaQueue = [];
//        $scope.mediaCount = $scope.mediaQueue.length;
        $scope.tweet = {};
        $scope.tweetsCount = 0;


        // Listen to new message
        $scope.startEventSource = function () {
            $scope.eventSourceUrl = $rootScope.baseUrl + "/api/events/" + $rootScope.eventID + "/adminEventSource";

            var source = new EventSource($scope.eventSourceUrl);

            source.addEventListener('tweet', function (response) {

                $scope.tweet = JSON.parse(response.data);
                
                if ($scope.tweet.extended_entities != null && $scope.tweet.extended_entities.media != null) {
//                    for each (var pic in mediaArray) {
//                        console.log(pic);
//                    }
                    $scope.tweetMedia = $scope.tweet.extended_entities.media[0].media_url_https;
                    console.log($scope.tweet.extended_entities.media[0].type);
                    $scope.mediaQueue.push($scope.tweetMedia);
                    $scope.mediaCount = $scope.mediaQueue.length;
                }
                $scope.$apply(function () {
                    $scope.tweetsQueue.push($scope.tweet);
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
        $scope.stopEventHandler = function () {

            var eventID = $rootScope.eventID;
            var requestAction = "DELETE";
            var apiUrl = '/api/events/' + eventID;
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.eventStarted = false;
                    //                    $state.transitionTo('home');
                })
        }


        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'areaspline',
                    height: 350,
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

            var requestAction = "GET";
            var apiUrl = '/api/events/' + $rootScope.eventID + '/overTime';

            // tweetsTimeRate = 1 : Gives you a tweets count reading every 1 minute
            var tweetsTimeRate = 1;

            // tweetsOverSpecificTime = -1 : Gives you the whole tweets since the event have been started
            var tweetsOverSpecificTime = -1;

            var requestData = {
                'sampleRate': tweetsTimeRate,
                'period': tweetsOverSpecificTime
            };

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.data = response.data;
                    $scope.tweetsTime = response.data.time;
                    $scope.tweetsCount = response.data.tweets_count;;

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
                            "name": "",
                            "data": tweetsCountArray,
                            connectNulls: true,
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
                                    height: 350,
                                    backgroundColor: 'rgba(255, 255, 255, 0.01)'
                                },
                                plotOptions: {
                                    series: {
                                        stacking: '',
                                        connectNulls: true
                                    },
                                    areaspline: {}
                                }
                            },
                            xAxis: {
                                categories: tweetsTimeArray,
                                gridLineWidth: 1,
                                dateTimeLabelFormats: {
                                    minute: '%H:%M',
                                    hour: '%H:%M',
                                },
                                type: 'datetime',

                                lineWidth: 1,
                                //						tickPixelInterval: 150,
                                labels: {
                                    enabled: false,
                                    style: {
                                        color: '#fff',
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
                                gridLineWidth: 1
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

                });
        }

        $scope.drawChart();


//        $scope.intervalFunction = function () {
//            $timeout(function () {
//                $scope.drawChart();
//                $scope.intervalFunction();
//            }, 1000)
//        };
//        $scope.intervalFunction();

}]);