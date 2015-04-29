'use strict';

var eventViewsApp = angular.module('eventViewsApp', ['eventAdminApp','ngAnimate', 'ngFx', 'highcharts-ng', 'ui.router', 'ngCookies']);

// Directive : Image lazy load
eventViewsApp.directive('lazyLoad', function ($timeout) {
    return {
        restrict: 'A',
        scope: {},
        link: function (scope, elem, attrs) {
            $timeout(function () {
                elem.attr('src', attrs.llSrc)
            });
        },
    }
});


eventViewsApp.directive('errSrc', function($rootScope) {
    $rootScope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";

    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});

// Directive : On error or missing user profile image -> Load this default image
eventViewsApp.directive('onErrorSrc', function ($rootScope) {

    $rootScope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";

    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
});

// Filter : Reverse tweets lists
eventViewsApp.filter('reverse', function () {
    var items = [];
    return function (items) {
        return items.slice().reverse();
    };
});

// Config : Views pages routing
eventViewsApp.config(function ($stateProvider, $urlRouterProvider) {

    window.routes = {
        "live": {
            url: '/live',
            templateUrl: '../../views/live-tweets.html',
            controller: 'liveTweetsCtrl'
        },
        "top": {
            url: '/top',
            templateUrl: '../../views/top_people.html',
            controller: 'TopPeopleCtrl'
        },
        "overtime": {
            url: '/overtime',
            templateUrl: '../../views/tweets-chart.html',
            controller: 'TweetsChatCtr'
        }
    };


    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});

// Factory : Get : Live tweets - Top active peopel - tweets over time
eventViewsApp.factory('getEventData', ['$http', '$rootScope','$cookies',function ($http, $rootScope,$cookies) {
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
            },
            getEventHashTag : function(){
                return $cookies.eventHashtag;
            }
        }
 }
]);

// Controller : Automatice views pages rotuing
eventViewsApp.controller('layoutCtrl', function ($scope, $timeout, $location,getEventData) {

        $scope.eventHashtag = getEventData.getEventHashTag();

        $scope.pages = ["/live", "/top", "/overtime"]
        $scope.pagesTimeout = [420000, 60000,60000]

        $scope.pageIndex = 0;

        $scope.intervalFunction = function () {
            $timeout(function () {
                $location.path($scope.pages[$scope.pageIndex]);
                $scope.pageIndex = ($scope.pageIndex + 1)%3;
                $scope.intervalFunction();
            }, $scope.pagesTimeout[$scope.pageIndex])
        };
        $scope.intervalFunction();

});

// Controller : Live Tweets View CTRL
eventViewsApp.controller('liveTweetsCtrl', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$location', '$window',
                                            function ($rootScope, $scope, $http, $cookies, $cookieStore, $location, $window) {

        $scope.init = function () {

            var apiUrl = "/api/liveTweets?uuid=" + $cookies.eventID;
            var requestUrl = $rootScope.baseUrl + apiUrl;

            $scope.liveTweetsUrl = requestUrl;
            var source = new EventSource($scope.liveTweetsUrl);
            var tweets = {};
            $scope.allTweets = [];

            source.addEventListener('message', function (response) {
                $scope.tweet = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.allTweets.push($scope.tweet);
                });
            });
        }

}]);

// Controller : Top People View CTRL
eventViewsApp.controller('TopPeopleCtrl', function ($scope, $http, $cookies, $timeout, getEventData) {
    
    $scope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";
    
    $scope.fetchData = function () {
        
        var eventID = $cookies.eventID;
        var requestAction = "GET";
        var apiUrl = '/api/events/' + eventID + '/topUsers';
        var topUsersCount = 6
        var requestData = {
            "count" : topUsersCount
        };
        
        
        getEventData.dataRequest(requestAction, apiUrl, requestData)
            .then(function (data) {
            $scope.data = data.topUsers;
        });
    }
    $scope.fetchData();
    $scope.intervalFunction = function () {
        $timeout(function () {
            $scope.fetchData();
            $scope.intervalFunction();
        }, 7000)
    };
    $scope.intervalFunction();

});

// Controller : Tweets Over Time View CTRL
eventViewsApp.controller('TweetsChatCtr', function ($scope, $http,$cookies, $timeout, getEventData) {
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

        var eventID = $cookies.eventID;
        var requestAction = "GET";
        var apiUrl = '/api/events/' + eventID + '/overTime';

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


    $scope.intervalFunction = function () {
        $timeout(function () {
            $scope.fetchData();
            $scope.intervalFunction();
        }, 1000)
    };
    $scope.intervalFunction();

});
