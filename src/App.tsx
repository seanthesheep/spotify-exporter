import { useEffect, useState } from 'react'

function App() {

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
  const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT;
  const RESPONSE_TYPE = import.meta.env.VITE_RESPONSE_TYPE;
  const LAMBDA_URL = import.meta.env.VITE_LAMBDA_URL;
  const timeStamp = new Date().getTime();

  const [token, setToken] = useState<string | null>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
      const tokenElement = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"));

      if (tokenElement) {
        storedToken = tokenElement.split("=")[1];
        window.location.hash = "";
        window.localStorage.setItem("token", storedToken);
      }
    }

    setToken(storedToken);
  }, [])

  /** 
   * Takes URL from S3 Bucket and downloads it as a file
   *
   * @param url - url of file retrieved from fetchPlaylists()
   * */
  const downloadPlaylists = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data (HTTP ${response.status})`);
    }
    const jsonData = await response.json();

    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.download = `your-playlists-${timeStamp}.json`;
    link.click();
    setIsLoading(false)

    URL.revokeObjectURL(blobUrl);
  }

  /**
   * Fetches all user playlists from Spotify via lambda function 
   * LAMBDA_URL.lambda-url.us-east-2.on.aws/'
   * */
  const fetchPlaylists = async () => {
    setIsLoading(true)
    const requestBody = {
      // note to songshift code reviewer: ideally a separate request would be made to retrieve 
      // the spotify user id to use here
      userId: timeStamp,
      token: token,
    };

    const requestBodyJson = JSON.stringify(requestBody);

    try {
      const playlistData = await fetch(`${LAMBDA_URL}`, {
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

      downloadPlaylists(playlists.url)

    } catch (err: any) {
      setIsLoading(false)
      console.error('Error:', err.message);
    }
  };

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-slate-800">
      <div className="max-w-md w-full p-6 rounded-md shadow-md bg-slate-600">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Spotify Playlist Fetcher</h1>
        </header>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            className="block w-full py-2 px-4 text-center bg-green-500 text-black font-semibold rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring focus:border-blue-300"
          >
            Login with Spotify
          </a>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
              </div>
            ) : (
              <div className="flex">
                <button
                  onClick={fetchPlaylists}
                  className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 mr-2">
                  Get Playlists
                </button>
                <button
                  onClick={logout}
                  className="bg-transparent hover:bg-red-800 text-white py-2 px-4 rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring focus:border-blue-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
