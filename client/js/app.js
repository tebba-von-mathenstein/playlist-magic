var app = angular.module("PlaylistMagic",['ngRoute']);

app.config(function($routeProvider, $httpProvider, $locationProvider){
  $routeProvider.when('/',{
    templateUrl: "/client/templates/userPlaylists.html",
    controller: "PlaylistsController",
    resolve: {
      spotifyMeData: function($http) {
        var accessTokenPr = $http({
          url: '/spot-auth/access-token',
          method: 'GET'
        });

        var meDataPromise = accessTokenPr.then(function(accessTokenResponse) {
          if(accessTokenResponse.data.access_token) {
            localStorage.setItem('spotifyAccessToken', accessTokenResponse.data.access_token);
          }
          return $http({
            url: 'https://api.spotify.com/v1/me',
            method: 'GET'
          });
        }).then(function(meResponse) {
          return meResponse.data;
        }).catch(function(error){
          return error;
        });

        return meDataPromise;
      }
    }
  }).when('/discography/:playlistId/',{
    templateUrl: "/client/templates/discography.html",
    controller: "DiscographyController",
  })
  .otherwise({
    redirectTo: '/'
  });
  
  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('SpotifyAccessInterceptor');
});

// Check for an access token and use it if we're
// making a request to Spotify.
app.service('SpotifyAccessInterceptor', function SpotifyAccessInterceptor(){
  return {
    request: function(config){
      var accessToken = localStorage.getItem('spotifyAccessToken');
      if(accessToken) {
        config.headers.authorization = "Bearer " + accessToken;
      }
      return config;
    }
  };
})