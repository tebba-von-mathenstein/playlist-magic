# Playlist Magic

The promise of Playlist Magic is to automatically create expanded personal playlists based on your existing playlists, or your input. Currently, it achieves none of those goals ;). Playlist Magic connects to Spotify using OAuth and will ultimately be able to create Spotify playlists using some specified parameters. The first playlist I wish to create is the "omnidiscography" playlist -- a playlist including EVERY track that Spotify has rights for for EVERY artist that appears in a provided seed playlist.

# Getting Started

```
npm install
node server/app.js
```

# Motivations

The primary motivation for this application was to build an OAuth implementation using Node and Angular without using an authentication library to help me understand the OAuth data-flow. There are still problems with the refresh token, among other things, but overall the exercise was very helpful. Playlist Magic might or might not see the lime-light of a true hosted app, but for now it stands as an example of one way to implement OAuth. 
