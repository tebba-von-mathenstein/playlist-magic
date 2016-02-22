var app = angular.module("PlaylistMagic");

app.factory("SpotifyRequester", function($http) {
    /**
     * Given a spotify artist url begin a series of requests that
     * ultimately fetches all the albums with their track list for
     * that artist.
     */
    function albumsAndTracks(artistId) {
        var artistUrl = 'https://api.spotify.com/v1/artists/' + artistId;
        return $http({
            url: artistUrl + '/albums',
            method: "GET",
        })
        .then(function(albumsResponse){
            var albumsData = albumsResponse.data;

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
                var obj = albumResponse.data;
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
    }

    /**
     * Given a userId and a playlist -- collect all the artists who appear
     * on the playlist, then generate their discography. Return an object
     * that the discographies.
     */
    function discographyPlaylist(userId, playlistId) {
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

            var artistsOnly = {};
            for(var respI in allTrackResponses) {

                var response = allTrackResponses[respI];
                for(var trackI in response.data.items) {
                    
                    var track = response.data.items[trackI].track;
                    for(var artI in track.artists) {

                        var artist = track.artists[artI];
                        if(artist.id) artistsOnly[artist.id] = artist.name;
                    }
                }
            }

            var allSongsPromises = [];
            for(artistId in artistsOnly) {
                allSongsPromises.push(albumsAndTracks(artistId));
            }

            return Promise.all(allSongsPromises)
        }).then(function(discographyResponses){
            console.log(discographyResponses);
        });
    };

    var SpotifyRequester = {
        albumsAndTracks: albumsAndTracks,
        discographyPlaylist: discographyPlaylist
    }
    return SpotifyRequester;
});
