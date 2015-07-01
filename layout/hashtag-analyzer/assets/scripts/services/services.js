'use strict';

/** Services */
angular.module('trackHashtagApp.services', [])

// Factory : Sweat Alert
.factory('SweetAlertFactory', function ($rootScope, $location, SweetAlert, User, GetEventsData) {
    
    return {
        
        showSweetAlert: function (alertText, alertConfirmButtonText) {
            
            this.sweetAlertObject =  SweetAlert.swal({
                title: "Are you sure?",
                text: alertText,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: alertConfirmButtonText,
                closeOnConfirm: true
            }, function (isConfirm) {
                if (isConfirm) {
                    GetEventsData.startServerEvent(eventHashtag);
                }
            });
            return this.sweetAlertObject;
        }
    }

});