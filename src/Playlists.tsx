import { useEffect, useState } from "react";

interface IPlaylistProps {
  /**Path to s3 for playlists json */
  url: string;
}

/** 
 * Component that fetches and displays playlists
 *
 * @param url - string of url to fetch
 * */
const Playlists = ({ url }: IPlaylistProps) => {

  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    getPlaylists(url)
  }, [url]);

  const getPlaylists = async (path: string) => {
    const res = await fetch(path);
    const playlistsData = await res.json();
    console.log(playlistsData)
    setPlaylists(playlistsData)
  }
  const openPlaylist = (id: string) => {
    window.open(`https://open.spotify.com/playlist/${id}`, "_blank", "noreferrer");
  };

  return (
    <div className="grid mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 cursor-pointer">
      {playlists.map((playlist: any) => (
        <div
          key={playlist.playlistName}
          className="transform opacity-60 group hover:opacity-100 transition-opacity duration-500"
        >
          <div
            style={{ backgroundImage: `url(${playlist.images[0].url})`, backgroundSize: 'cover' }}
            className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden"
            onClick={() => openPlaylist(playlist.playlistId)}
          >
            <div className="flex flex-col justify-center items-center min-h-[300px]">
              <div className="bg-green-500 w-full text-center bg-opacity-80 min-h-[70px] flex items-center justify-center">
                <h2 className="m-1 text-lg font-extrabold text-white mt-2 hover:text-xl text-center">
                  {playlist.playlistName}
                </h2>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Playlists;
