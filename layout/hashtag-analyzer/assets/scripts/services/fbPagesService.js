angular.module('trackHashtagApp.services').factory('FbPagesFactory', function ($resource) {
 	return $resource('/api/fb_pages', {}, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST' }
    })
});

angular.module('trackHashtagApp.services').factory('FbPageFactory', function ($resource) {
   return $resource('/api/fb_pages/:fb_page', {}, {
        delete: { method: 'DELETE', params: {fb_page: '@fb_page'} }
    })
});