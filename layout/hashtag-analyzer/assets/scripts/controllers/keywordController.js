
var KeywordController = angular.module('KeywordController', []);


KeywordController.controller('KeywordController', ['$scope','$state', '$stateParams', 'KeywordsFactory', 'KeywordEmailsFactory', 'KeywordPeriodFactory', 'KeywordFactory', 'EmailsFactory', 'EmailFactory', '$location',
    function ($scope, $state, $stateParams, KeywordsFactory, KeywordEmailsFactory, KeywordPeriodFactory, KeywordFactory, EmailsFactory, EmailFactory, $location) {
    	$scope.emails = EmailsFactory.query();
    	$scope.registered_emails = [];
    	$scope.registered_emails.push();
    	KeywordPeriodFactory.get_period($stateParams.keyword_id).then(function(result) {
	    	$scope.keyword_period = result.data;
    	}, function(error) {
    		//error
    	});

    	KeywordEmailsFactory.get_emails($stateParams.keyword_id).then(function(result) {
	    	$scope.selected_emails = result.data;
    	}, function(error) {
    		//error
    	});


    	

    	$scope.keyword_periods = [
		    {'name': 'None',
		     'value': 0},
		    {'name': 'Daily',
		     'value': 1},
		    {'name': 'Weekly',
		     'value': 2},
	     	{'name': 'Monthly',
		     'value': 3}
	  	];

	  	// $scope.selected_emails = [1];


		$scope.saveKeywordConfig = function() {
			var config = {};
			config["period"] = $scope.keyword_period;
			config["emails"] = $scope.selected_emails;

			KeywordPeriodFactory.update($stateParams.keyword_id, config).then(function(result) {
				// success callback
			}, function(error) {
				console.log('Fail : ', error);
			});
			$state.go('keywords.index');
		}

 	}]);

  //Setting first option as selected in configuration select
