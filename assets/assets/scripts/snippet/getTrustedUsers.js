
// 1. Factory : Get Trusted Users List Data
eventAdminApp.factory("getTrustedUsers", function () {
    var trustedUsers = {};
    trustedUsers.data = [{
            name: 'iMomenUI',
            img: '../assets/images/user-image-1.png'
  },
        {
            name: 'JustSmileDad',
            img: '../assets/images/user-image-2.png'
  },
        {
            name: 'AngularJS',
            img: '../assets/images/user-image-3.png'
  }];
    return trustedUsers;
});
