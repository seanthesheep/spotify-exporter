# Spotify Exporter

An app that exports all of a user's Spotify playlists as a json file.

- uses AWS lambda, S3, and Amplify
- user logs in from client and lambda function fetches playlists and returns an S3 bucket URL
- client downloads json file from url

Client app is built with React and Vite with TailwindCSS for styling.

To run:

```
git clone https://github.com/seanthesheep/spotify-exporter.git`
cd spotify-exporter
npm install
npm run dev
```
