import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


export const handler = async (event, context) => {
  const body = JSON.parse(event.body)
  const fetchPlaylists = async () => {
    try {
      const playlistData = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${body.token}`,
        },
      });

      if (!playlistData.ok) {
        throw new Error(`Failed to fetch playlists. Status: ${playlistData.status}`);
      }

      const playlists = await playlistData.json();

      const trackPromises = playlists.items.map(async (playlist) => {
        const trackData = await fetch(playlist.tracks.href, {
          headers: {
            Authorization: `Bearer ${body.token}`,
          },
        });

        if (!trackData.ok) {
          throw new Error(`Failed to fetch tracks for playlist ${playlist.name}. Status: ${trackData.status}`);
        }

        return {
          playlistName: playlist.name,
          images: playlist.images,
          href: playlist.href,
          playlistId: playlist.id,
          tracks: await trackData.json(),
        };
      });

      const playlistsWithTracks = await Promise.all(trackPromises);

      return playlistsWithTracks;

      console.log('Data saved to playlists_data.json');
    } catch (err) {
      console.error('Error:', err.message);
    }
  };
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const playlists = await fetchPlaylists();
    const key = `save-files-to-s3/${body.userId}.json`;
    const params = {
      Bucket: "myspotifyplaylists",
      Key: key,
      Body: JSON.stringify(playlists),
      ContentType: 'application/json; charset=utf-8'
    }
    const client = new S3Client();
    const command = new PutObjectCommand(params);
    const response = await client.send(command);
    const objectUrl = `https://myspotifyplaylists.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File saved successfully', url: objectUrl }),
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
