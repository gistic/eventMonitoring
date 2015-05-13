var tweetsOverTimeController = angular.module('tweetsOverTimeController', []);


// Controller : Get tweets over time stats
tweetsOverTimeController.controller('TweetsOverTimeController', ['$scope', '$rootScope', '$http', '$timeout', 'RequestData', function ($scope, $rootScope, $http, $timeout, RequestData) {
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


        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (data) {
                $scope.data = data;
                $scope.tweetsTime = data.time;
                $scope.tweetsCount = data.count;

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

                drawTweetsOverTimeChart();

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

}]);
