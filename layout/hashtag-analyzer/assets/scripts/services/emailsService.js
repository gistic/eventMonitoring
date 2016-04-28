angular.module('trackHashtagApp.services').factory('EmailsFactory', function ($resource) {
 	return $resource('/api/emails', {}, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST' },
    })
});

angular.module('trackHashtagApp.services').factory('EmailFactory', function ($resource) {
   return $resource('/api/emails/:email_id', {}, {
        delete: { method: 'DELETE', params: {email_id: '@email_id'} }
    })
});