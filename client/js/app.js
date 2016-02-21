var app = angular.module("PlaylistMagic",['ngRoute']);

app.config(function($routeProvider, $httpProvider){
  $routeProvider.when('/',{
    templateUrl: "/client/templates/userPlaylists.html",
    controller: "PlaylistsController",
  });
  $httpProvider.interceptors.push('SpotifyAccessInterceptor');
});

// Check for an access token and use it if we're
// making a request to Spotify.
app.service('SpotifyAccessInterceptor', function SpotifyAccessInterceptor(){
  return {
    request: function(config){
      return config;
    }
  };
})