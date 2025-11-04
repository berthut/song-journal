export default function EntryCard({ entry }) {
  const date = new Date(entry.date);
  const pretty = date.toLocaleString();

  return (
    <div className="entry-card">
      <div className="entry-meta">
        <div className="entry-date">{pretty}</div>
        {entry.mood && (
          <div className="entry-mood">
            {entry.mood.split(",").map((m, i) => (
              <span key={i} className="mood-tag">{m.trim()}</span>
          ))}
          </div>
        )}
      </div>

      {entry.spotifyId ? (
        <div className="spotify-embed">
          <iframe
            title={`spotify-${entry.spotifyId}`}
            src={`https://open.spotify.com/embed/track/${entry.spotifyId}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="encrypted-media"
          ></iframe>
        </div>
      ) : (
        <div className="no-spotify">No valid Spotify track ID — saved raw link.</div>
      )}

      {entry.note && <div className="entry-note">💭 {entry.note}</div>}
    </div>
  );
}