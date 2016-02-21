var request = require('request');

/**
 * This is a simple (not completely robust) method to use 
 * promises with the request.get method.  
 */
function promisifyGet(url) {
	// NOTICE WE ARE RETURNING A PROMISE.
	return new Promise(function(resolve, reject) {
		
		// Make a request to url
		request.get(url, function(error, response, body){
			// Just like normal, we used a callback to recieve
			// data from request, 
			if(error) {
				// Reject this promise, which triggers "Catch" or
				// the second function in a .then()
				reject(error);
			}
			else {
				// Resolve this promise, which triggers the first
				// function in a .then()
				resolve(response);
			}
		}); // End of callback
	});// End of promise constructor
}

// Yuck, this is a gross function for making the data pretty
function prettyPrintAlbums(albumsData) {
	for(i in albumsData){
		var current = albumsData[i];
		console.log("\n====" + current.name + "====");
		console.log("Released: " + current.releaseDate);
		for(j in current.tracks.items) {
			var track = current.tracks.items[j];
			var spaces = " ";
			if(j < 10) spaces += " ";
			console.log("  " + j + '.' + spaces + track.name);
		}
	}
}

// Lets make a get request to Spotify, using our promisify function
// This URL corresponds to a search for whatever artist you put in
// or a great hip-hop group The Sound Providers
var artist = process.argv[2] || "Sound Providers";
var spotifyPromise = promisifyGet('https://api.spotify.com/v1/search?type=artist&q=' + artist);

// Normally, we would have to handle this in a callback function. 
// And this looks similar, we are still passing in a function to 
// .then()
spotifyPromise.then(function(searchResponse){
	// searchResponse came from line 24, when the promise was resolved
	// the data came from the http request.
	var artists = JSON.parse(searchResponse.body).artists;

	// I want to extract a couple data points from each
	artists = artists.items.map(function(artistObj) {
		return {
			name: artistObj.name,
			id: artistObj.id,
			url: artistObj.href
		}
	});

	// I happen to know the first item in my search is the artist I want
	var desiredArtist = artists[0];

	// Lets make a request to fetch all the albums for this artist
	// And we'll return a promise so that we can enjoy promise chaining
	// in all it's glory
	return promisifyGet(desiredArtist.url + '/albums');
})
// Because the first .then() returns a promise, we can call .then again
.then(function(albumsResponse){
	var albumsData = JSON.parse(albumsResponse.body);

	// Again, I just want a subset of the dat
	albumsData = albumsData.items.map(function(albumObj) {
		return {
			name: albumObj.name,
			url: albumObj.href
		}
	});

	// So, now we have a bunch of albums, and we want to fetch
	// tracks and release dates for each of these!
	// Lets use the all powerful Promise.all() to return a 
	// promise, which will not be resolved until ALL the individual
	// promises are resolved.
	var albumPromises = [];
	for(i in albumsData){
		var curAlbum = albumsData[i];
		var curAlbumPromise = promisifyGet(curAlbum.url);
		albumPromises.push(curAlbumPromise);
	}

	// At this point albumsPromises is several (unresolved) promises.
	// We're going to return a SINGLE promise which resolves when ALL
	// the promises inside of albumPromises have been resolved or rejected
	return Promise.all(albumPromises);
})
.then(function(resolvedAlbums){
	// The data from resolved albums is the whole HTTP response, so 
	// once again I'm going to map the data to the subset I want.
	var expandedAlbumData = resolvedAlbums.map(function(albumResponse) {
		var obj = JSON.parse(albumResponse.body);
		return {
			name: obj.name,
			releaseDate: obj.release_date,
			tracks: obj.tracks
		}
	});

	// Now, expandedAlbumData is all the information we 
	// really care about. Lets print it. 
	prettyPrintAlbums(expandedAlbumData);
})
.catch(function(error) {
	console.log(error);
});

