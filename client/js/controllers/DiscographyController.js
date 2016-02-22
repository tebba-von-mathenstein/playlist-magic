var app = angular.module("PlaylistMagic");

app.controller("DiscographyController", function($scope, $routeParams, SpotifyRequester){
    console.log(SpotifyRequester);
    console.log($routeParams);

    SpotifyRequester.discographyPlaylist($routeParams.userId, $routeParams.playlistId);
});