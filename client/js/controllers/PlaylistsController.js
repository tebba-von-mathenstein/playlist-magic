var app = angular.module("PlaylistMagic");

app.controller("PlaylistsController", function($scope, $http){
    $scope.playlists = [{name: "blah"}, {name:"doubleBlah"}]
}) ;