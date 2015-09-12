myApp.factory('Authentication', 
  ['$firebaseAuth', '$firebaseArray',
  '$firebaseObject', '$rootScope',
  '$routeParams', '$location', 'FIREBASE_URL',
  function( $firebaseAuth, $firebaseArray,
  $firebaseObject, $rootScope,
  $routeParams, $location, FIREBASE_URL) {

  var ref = new Firebase(FIREBASE_URL);
  var auth = $firebaseAuth(ref);

  auth.$onAuth(function(authUser) {
    if (authUser) {
      var ref = new Firebase(FIREBASE_URL + '/users/' + authUser.uid);
      var meetingsRef = new Firebase(FIREBASE_URL + '/users/' + authUser.uid + '/meetings');
      var user = $firebaseObject(ref);
      var meetingsArray = $firebaseArray(meetingsRef);
      $rootScope.currentUser = user;

      meetingsArray.$loaded(function(data) {
        $rootScope.howManyMeetings = meetingsArray.length;
      });

      meetingsArray.$watch(function(data) {
        $rootScope.howManyMeetings = meetingsArray.length;
      });

    } else {
      $rootScope.currentUser = '';
    }
  });

  //Temporary object
  var myObject = {

    login: function(user) {
      return auth.$authWithPassword({
        email: user.email,
        password: user.password
      }).then(function(user) {
        $location.path('/meetings');
      }).catch(function(error) {
        $rootScope.message = error.message;
      }); //authWithPassword
    }, //login

    logout: function(user) {
      return auth.$unauth();
    }, //login

    register: function(user) {
      return auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function(regUser) {
        var ref = new Firebase(FIREBASE_URL +
         'users')
        .child(regUser.uid).set({
          date : Firebase.ServerValue.TIMESTAMP,
          regUser : regUser.uid,
          firstname: user.firstname,
          lastname : user.lastname,
          email: user.email
        }); //user info
        myObject.login(user);
      }).catch(function(error) {
        $rootScope.message = error.message;
      }); //promise
    }, //register

    requireAuth: function() {
      return auth.$requireAuth();
    }, //require Authentication

    waitForAuth: function() {
      return auth.$waitForAuth();
    } //Wait until user is Authenticated


  }; //myObject
  return myObject;
}]); //myApp Factory
