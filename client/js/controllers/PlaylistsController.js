var app = angular.module("PlaylistMagic");

app.controller("PlaylistsController", function($scope, $http, spotifyMeData){
    var playlists = [];

    $scope.displayName = spotifyMeData.display_name;
    $http({
        url: spotifyMeData.href + "/playlists",
        method: "GET"
    }).then(function(playlistResp) {
        console.log(playlistResp)
        playlists = playlistResp.data.items;

        $scope.playlists = playlists.map(function(playlist) {
            return {
                name: playlist.name,
                href: playlist.href,
                id:   playlist.id
            }
        });
    })
}) ;
