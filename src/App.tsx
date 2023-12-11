import { useEffect, useState } from 'react'

function App() {

  const CLIENT_ID = "c72b06e411024710b5398901c7aebc41"
  const REDIRECT_URI = "http://localhost:5173"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState<string | null>("")

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }
    setToken(token)
    console.log('token ', token)
  }, [])

  const downloadPlaylists = (playlist: object) => {
    const filename = "your-playlists.json";
    const fileToSave = new Blob([JSON.stringify(playlist)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(fileToSave);
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = filename;
    link.click();
  }



  const fetchPlaylists = async () => {
    const requestBody = {
      userId: token,
      token: token,
    };

    // Convert the data to JSON format
    const requestBodyJson = JSON.stringify(requestBody);
    try {
      // Fetch playlists
      const playlistData = await fetch('https://ybstosz3dyfnno6sr6szwgu2ni0ikikr.lambda-url.us-east-2.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBodyJson
      });

      if (!playlistData.ok) {
        throw new Error(`Failed to fetch playlists. Status: ${playlistData.status}`);
      }

      const playlists = await playlistData.json();

      downloadPlaylists(playlists)

      console.log('Data saved to playlists_data.json');
    } catch (err: any) {
      console.error('Error:', err.message);
    }
  };


  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-md shadow-md">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Spotify Playlist Fetcher</h1>
        </header>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            className="block w-full py-2 px-4 text-center bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring focus:border-blue-300"
          >
            Login to Spotify
          </a>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={logout}
              className="bg-red-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring focus:border-blue-300"
            >
              Logout
            </button>
            <button
              onClick={fetchPlaylists}
              className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
            >
              Get Playlists
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App