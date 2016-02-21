var request = require('request');
var querystring = require('querystring');

var app = require('express').Router();
var SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
var SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_SECRET;
var SPOTIFY_REDIRECT_URI  = process.env.SPOTIFY_REDIRECT_URI;
var stateKey = 'spotify_auth_state';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Handle Spotify login - redirect users to "login with spotify"
 * page passing our OAuth credentials & callback uri.
 */
app.get('/login-spotify', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: state
    }));
});

/** 
 * Triggered by Login with Spotify OAuth flow. Spotify will
 * send us a response indicating success or failure of the 
 * OAuth login attempt. Code provided by Spotify. On success
 * add the access and refresh tokens to a cookie.
 * 
 * https://raw.githubusercontent.com/spotify/web-api-auth-examples/master/authorization_code/app.js
 */
app.get('/spotify-creditials-callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null) {
    throw new Error("Invalid State: state parameter cannot be null. storedState: " + storedState);
  } else if(state !== storedState) {
    throw new Error("Invalid State: state(" + state + ") should be equal to storedState(" + storedState + ") ");
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        // Save the tokens in a cookie
        res.cookie('spotifyAccessToken', body.access_token);
        res.cookie('spotifyRefreshToken', body.refresh_token);
        res.redirect('/');
      } else {
        throw new Error(error);
      }
    });
  }
});

/**
 * Request a new access token from a refresh token.
 * Returns a JSON object containing the access_token.
 */
app.get('/refresh-token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.json({
        'access_token': access_token
      });
    }
    else {
      res.status(500);
      res.json(error);
    }
  });
});

/**
 * Return the cookie-session-user's access token
 */
app.get('/access-token', function(req, res) {

  if(req.cookies.spotifyAccessToken) {
    res.json({
      'access_token': req.cookies.spotifyAccessToken
    });
  }
  else if(req.cookies.spotifyRefreshToken) {
    res.redirect('refresh-token?refresh_token=' + req.cookies.spotifyRefreshToken);
  }
  else {
    res.status(403);
    res.json({
      'error': "User had no refresh token cookie so we could not fetch the access token."
    });
  }
});

module.exports = app;