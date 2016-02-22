var app = angular.module("PlaylistMagic");

app.factory("SpotifyRequester", function($http) {
    var SpotifyRequester = {
        
        /**
         * Given a spotify artist url begin a series of requests that
         * ultimately fetches all the albums with their track list for
         * that artist.
         */
        albumsAndTracks: function albumsAndTracks(artistId) {
            var artistUrl = 'https://api.spotify.com/v1/artists/' + artistId;
            $http({
                url: artistUrl + '/albums',
                method: "GET",
            })
            .then(function(albumsResponse){
                var albumsData = JSON.parse(albumsResponse.body);

                albumsData = albumsData.items.map(function(albumObj) {
                    return {
                        name: albumObj.name,
                        url: albumObj.href
                    }
                });

                var albumPromises = [];
                for(i in albumsData){
                    var curAlbum = albumsData[i];
                    var curAlbumPromise = $http({
                        url: curAlbum.url,
                        method: "GET"
                    });

                    albumPromises.push(curAlbumPromise);
                }

                return Promise.all(albumPromises);
            })
            .then(function(resolvedAlbums){
                var expandedAlbumData = resolvedAlbums.map(function(albumResponse) {
                    var obj = JSON.parse(albumResponse.body);
                    return {
                        name: obj.name,
                        releaseDate: obj.release_date,
                        tracks: obj.tracks
                    }
                });

                return expandedAlbumData;
            })
            .catch(function(error) {
                console.log(error);
                return error;
            });
        },

        discographyPlaylist: function(userId, playlistId) {
            var playlistTracksUrl = 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks'
            
            $http({
                url: playlistTracksUrl,
                method: "GET"
            }).then(function(tracksResp) {
                var tracksPromises = [tracksResp];
                console.log(tracksResp.data);

                // Spotify API limit is 100 -- we want all tracks so
                if(tracksResp.data.total > 100) {
                    for(var i = 99; i < tracksResp.data.total; i += 100) {
                        var extraTracksUrl = 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?offset=' + i;
                        tracksPromises.push($http({
                            url: extraTracksUrl,
                            method: "GET"
                        }));
                    }
                }
                return Promise.all(tracksPromises);
            }).then(function(allTrackResponses){
                console.log(allTrackResponses);
            });
        }
    };

    return SpotifyRequester;
});
