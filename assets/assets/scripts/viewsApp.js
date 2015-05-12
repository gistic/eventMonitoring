'use strict';

var eventViewsApp = angular.module('eventViewsApp', ['eventAdminApp', 'ngRoute','ngAnimate', 'ngFx', 'highcharts-ng', 'ui.router', 'ngCookies', 'myAppDirectives', 'myAppFilters']);


eventAdminApp.run(function ($rootScope, $location) {
    $rootScope.eventID = $location.search().uuid;
});

// Config : Views pages routing
eventViewsApp.config(function ($stateProvider, $urlRouterProvider) {

    window.routes = {
        "live": {
            url: '/live?uuid',
            templateUrl: '../../views/presentation/live-tweets.html',
            controller: 'liveTweetsCtrl'
        },
        "top": {
            url: '/top?uuid',
            templateUrl: '../../views/presentation/top_people.html',
            controller: 'TopPeopleCtrl'
        },
        "overtime": {
            url: '/overtime?uuid',
            templateUrl: '../../views/presentation/tweets-chart.html',
            controller: 'TweetsChatCtr'
        }
    };


    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});

// Factory : Get : Live tweets - Top active peopel - tweets over time
eventViewsApp.factory('getEventData', ['$http', '$rootScope', '$cookies', function ($http, $rootScope, $cookies) {
        return {
            dataRequest: function (requestMethod, apiUrl, requestParamaters) {

                var requestUrl = $rootScope.baseUrl + apiUrl;

                return $http({
                    method: requestMethod,
                    url: requestUrl,
                    params: requestParamaters,
                }).then(function (result) {
                    return result.data;
                });
            }
        }
 }
]);

// Controller : Looping through views pages
eventViewsApp.controller('layoutCtrl', function ($rootScope, $scope, $timeout, $location, getData, createEventSource) {

        var source = createEventSource.getSourceObject();

        source.addEventListener('broadcast-ui-customization', function (response) {
            $scope.layoutOptions = JSON.parse(response.data);
            $scope.$apply(function () {
                $rootScope.userColor = $scope.layoutOptions.backgroundColor;
                $rootScope.userSize = $scope.layoutOptions.size;
                $rootScope.pages = $scope.layoutOptions.screens;
                $rootScope.pagesTimeout = $scope.layoutOptions.screenTimes;
                $rootScope.eventHashtag = $scope.layoutOptions.hashtags;
            });
        });

    $rootScope.getViewOptions = function () {

        var requestAction = "GET";
        var apiUrl = '/api/events/' + $rootScope.eventID + '/config';
        var requestData = "";

        getData.fetchData(requestAction, apiUrl, requestData)
            .success(function (response) {
                $rootScope.userColor = response.backgroundColor;
                $rootScope.userSize = response.size;
                $rootScope.pagesTimeout = response.screenTimes;
                $rootScope.pages = response.screens;

                // Get the current page path index
                $rootScope.eventHashtags = response.hashtags;
                $scope.pageIndex = $scope.pages.indexOf($location.path());
                $scope.intervalFunction();
            }).error(function () {
                console.log("#");
            })
    }

    $scope.test = function () {
        $rootScope.getViewOptions();
    }


    $scope.intervalFunction = function () {
        $timeout(function () {

            // Close event source when leaving the live tweets screen
            //                if (!createEventSource.closed) {
            //                    createEventSource.closeEventSource();
            //                }

            // Redirect the page
            $location.path($scope.pages[$scope.pageIndex]);
            $scope.intervalFunction();

        }, $scope.pagesTimeout[$scope.pageIndex])
        $scope.pageIndex = ($scope.pageIndex + 1) % 3;
    };

});


eventViewsApp.factory('createEventSource', function ($rootScope, $cookies, getData, $location) {

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


});

// Controller : Live Tweets View CTRL
eventViewsApp.controller('liveTweetsCtrl', ['$scope', 'createEventSource', function ($scope, createEventSource) {
        $scope.init = function () {

            var source = createEventSource.getSourceObject();

            var tweets = {};
            $scope.allTweets = [];

            source.addEventListener('approved-tweets', function (response) {
                $scope.tweet = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.allTweets.push($scope.tweet);
                });
            });
        }

}]);

// Controller : Top People View CTRL
eventViewsApp.controller('TopPeopleCtrl', function ($scope, $rootScope, $http, $cookies, $timeout, getEventData) {

    $scope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";

    $scope.fetchData = function () {

        var requestAction = "GET";
        var apiUrl = '/api/events/' + $rootScope.eventID + '/topUsers';
        var topUsersCount = 5
        var requestData = {
            "count": topUsersCount
        };


        getEventData.dataRequest(requestAction, apiUrl, requestData)
            .then(function (data) {
                $scope.data = data.topUsers;
            });
    }
    $scope.fetchData();

    //    $scope.intervalFunction = function () {
    //        $timeout(function () {
    //            $scope.fetchData();
    //            $scope.intervalFunction();
    //        }, 600000)
    //    };
    //    $scope.intervalFunction();

});

// Controller : Tweets Over Time View CTRL
eventViewsApp.controller('TweetsChatCtr', function ($scope, $rootScope, $http, $cookies, $timeout, getEventData) {
    $scope.chartConfig = {
        options: {
            chart: {
                type: 'areaspline',
                height: 450,
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
            },
            title: {
                text: ''
            }

        },
    };
    $scope.tweetsTime = [];
    $scope.tweetsCount = [];

    $scope.fetchData = function () {

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


        getEventData.dataRequest(requestAction, apiUrl, requestData)
            .then(function (data) {
                $scope.data = data;
                $scope.tweetsTime = data.time;
                $scope.tweetsCount = data.count;

                function drawDailyChart() {
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
                        color: 'rgba(3, 19, 47,0.7)'
    }];
                    $scope.chartConfig = {
                        options: {
                            chart: {
                                type: 'areaspline',
                                animation: {
                                    duration: 1500
                                },
                                height: 450,
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
                            dateTimeLabelFormats: {
                                minute: '%H:%M',
                                hour: '%H:%M',
                            },
                            type: 'datetime',

                            lineWidth: 3,
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
                                width: 1,
                                color: '#ffffff'
                }],
                            title: {
                                text: 'Number Of Tweets',
                                style: {
                                    color: '#fff',
                                    font: '11px Trebuchet MS, Verdana, sans-serif'
                                }
                            },
                            labels: {
                                enabled: true,
                                style: {
                                    color: '#fff',
                                    font: '11px Trebuchet MS, Verdana, sans-serif'
                                }
                            },
                            tickWidth: 0,
                            gridLineWidth: 0
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
                drawDailyChart();

            });
    }
    $scope.fetchData();


    //    $scope.intervalFunction = function () {
    //        $timeout(function () {
    //            $scope.fetchData();
    //            $scope.intervalFunction();
    //        }, 60000)
    //    };
    //    $scope.intervalFunction();

});
