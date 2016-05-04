angular.module('trackHashtagApp.services').factory('KeywordsFactory', function ($resource) {
 	return $resource('/api/keywords', {}, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST' }
    })
});

angular.module('trackHashtagApp.services').factory('KeywordFactory', function ($resource) {
   return $resource('/api/keywords/:keyword', {}, {
        delete: { method: 'DELETE', params: {keyword: '@keyword'} }
    })
});

// angular.module('trackHashtagApp.services').factory('KeywordEmailsFactory', function ($resource) {
//    return $resource('/api/keywords/:keyword_id/emails', {keyword_id: '@keyword_id'}, {
//         query: { method: 'GET', isArray: true }
//     })
// });

// angular.module('trackHashtagApp.services').factory('KeywordPeriodFactory', function ($resource) {
//    return $resource('/api/keywords/:keyword_id/period', {keyword_id: '@keyword_id'}, {
//         get_period: { method: 'GET' , params: {keyword: '@keyword'} }
//     })
// });

angular.module('trackHashtagApp.services').factory('KeywordEmailsFactory', function ($http) {
	var fn = {};
	fn.get_emails = function(keyword_id) {
		var url = '/api/keywords/' + keyword_id +'/emails';
		return $http({
			method: 'GET',
			url: url
		});
	}
	return fn;
});

angular.module('trackHashtagApp.services').factory('KeywordPeriodFactory', function ($http) {
	var fn = {};
	fn.get_period = function(keyword_id) {
		var url = '/api/keywords/' + keyword_id +'/period';
		return $http({
			method: 'GET',
			url: url
		});
	}

	fn.update = function(keyword_id, data) {
		var url = '/api/keywords/' + keyword_id;
		return $http({
			method: 'POST',
			url: url,
			params: {},
			data: data 
		});
	}
	return fn;
});