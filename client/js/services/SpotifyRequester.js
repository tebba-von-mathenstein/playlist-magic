var app = angular.module("PlaylistMagic");

app.factory("SpotifyRequester", function($http) {
    var SpotifyRequester = {
        
        /**
         * Given a spotify artist url begin a series of requests that
         * ultimately fetches all the albums with their track list for
         * that artist.
         */
        albumsAndTracks: function albumsAndTracks(artistUrl) {
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
        }
    };

    return SpotifyRequester;
});
