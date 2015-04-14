'use strict';

var fileUploadApp = angular.module('fileUploadApp', ['angularFileUpload']);

fileUploadApp.controller('uploadCtrl', ['$scope', '$http', '$timeout', '$compile', '$upload', function ($scope, $http, $timeout, $compile, $upload) {
	$scope.$watch('files', function () {
		$scope.upload($scope.files);
	});
	
		$scope.generateThumb = function(file) {
		if (file != null) {
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							file.dataUrl = e.target.result;
						});
					}
				});
			}
		}
	};

	$scope.upload = function (files) {
		if (files && files.length) {
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				$upload.upload({
					url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
					file: file
				}).progress(function (evt) {
					file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					console.log('progress: ' + progressPercentage + '% ' +
						evt.config.file.name);
				}).success(function (data, status, headers, config) {

					console.log('file ' + config.file.name + 'uploaded. Response: ' +
						JSON.stringify(data));
				});
			}
		}
	};
}]);