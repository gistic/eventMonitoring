        //        console.log($state);

        //        if ($state.current.url == "/admin?uuid") {
        //            $scope.$on('$locationChangeStart', function (event) {
        //                var answer = confirm("Are you sure you want to leave this page?");
        //                console.log(answer);
        //                if (answer) {
        //                    console.log(answer);
        //                    $scope.stopEventHandler();
        //                    // Redirect the front website page to the admin page
        ////                    $state.transitionTo('admin');
        //                } else {
        ////                    event.preventDefault();
        //                    console.log(answer);
        //                }
        //            });
        //
        //        }
                                                
    if ($state.current.url == "/admin?uuid") {
        window.onbeforeunload = function (event) {
            var message = 'If you close this window your event will stop.';
            if (typeof event == 'undefined') {
                event = window.event;
            }
            $scope.stopEventHandler();
            return message;
            
        }
    }
//        if ($state.current.url == "/admin?uuid") {
//            $scope.$on('$locationChangeStart', function (event, next, current) {
//                console.log($state.current.url);
//                var answer = confirm("Are you sure you want to navigate away from this page");
//            });
//        }

        //        $scope.$on('$locationChangeStart', function (event, next, current) {
        //            if ($state.current.url == "/admin?uuid") {
        //                var answer = confirm("Are you sure you want to navigate away from this page");
        //                if (!answer) {
        ////                    event.preventDefault();
        //                    console.log(answer);
        //                } else {
        //                    console.log(answer);
        //                }
        //                
        //            }
        //        });

        //        window.onbeforeunload = function (e) {
        //            if (check(document.URL))
        //                return check(document.URL);
        //            else
        //                return undefined;
        //        };