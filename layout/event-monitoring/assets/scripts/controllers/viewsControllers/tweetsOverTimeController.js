var tweetsOverTimeController = angular.module('tweetsOverTimeController', []);


// Controller : Get tweets over time stats
tweetsOverTimeController.controller('TweetsOverTimeController', ['$scope', '$rootScope', '$http', '$timeout', 'RequestData', function($scope, $rootScope, $http, $timeout, RequestData) {
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

    $scope.fetchData = function() {

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

        function colorNameToRGB(color) {

            var chartColorsArray = {
                "black": "rgb(90, 90, 90)",
                "turquoise": "rgb(22, 153, 140)",
                "blue": "rgb(21, 95, 145)",
                "violet": "rgb(182, 132, 247)",
                "pink": "rgb(161, 21, 56)",
                "green": "rgb(21, 123, 98)",
                "orange": "rgb(174, 53, 31)"
            }

            return chartColorsArray[color.toLowerCase()];
        }

        var chartBgColor = colorNameToRGB($scope.userColor);


        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function(response) {
                $scope.data = response.data;
                $scope.tweetsTime = response.data.time;
                $scope.tweetsCount = response.data.tweets_count;;

                function drawTweetsOverTimeChart() {
                    var arrayLength = $scope.data.length;

                    var tweetsCountArray = [],
                        tweetsTimeArray = [];
                    $scope.totalTweets = 0;
                    for (var i = 0; i < arrayLength; i++) {
                        tweetsCountArray[i] = $scope.data[i].tweets_count;
                        $scope.totalTweets += $scope.data[i].tweets_count;

                        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                        var date = new Date($scope.data[i].time);
                        var day = date.getDate();
                        var monthIndex = date.getMonth();
                        var year = date.getFullYear();
                        var hour = date.getHours();
                        var minutes = date.getMinutes();

                        tweetsTimeArray[i] = hour + ':' + minutes + ' ' + day + ' ' + monthNames[monthIndex];
                    }

                    $scope.chartSeries = [{
                        "name": "Tweets over time",
                        "data": tweetsCountArray,
                        connectNulls: true,
                        showInLegend: false,
                        "id": "tweetsChart",
                        color: chartBgColor
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
                            labels: {
                                enabled: true,
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
                    $scope.reflow = function() {
                        $scope.$broadcast('highchartsng.reflow');
                    };
                }

                drawTweetsOverTimeChart();

            });
    }

    $scope.fetchData();

}]);
