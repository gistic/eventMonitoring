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