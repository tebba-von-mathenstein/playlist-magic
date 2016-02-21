var app = angular.module("PlaylistMagic",['ngRoute']);

app.config(function($routeProvider, $httpProvider){
  $routeProvider.when('/',{
    templateUrl: "/client/templates/userPlaylists.html",
    controller: "PlaylistsController",
    resolve: {
      spotifyMeData: function($http) {
        var accessTokenPr = $http({
          url: '/spot-auth/access-token',
          method: 'GET'
        }).then(function(accessTokenResponse) {
          console.log(accessTokenResponse);
          if(accessTokenResponse.data.access_token) {
            localStorage.setItem('spotifyAccessToken', accessTokenResponse.data.access_token);
          }
          return $http({
            url: 'https://api.spotify.com/v1/me',
            method: 'GET'
          });
        }).then(function(meResponse) {
          console.log(meResponse);
          return meResponse.data;
        }).catch(function(error){
          console.log(error);
          return error;
        });

        return accessTokenPr;
      }
    }
  })
  .otherwise({
    redirectTo: '/'
  });

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