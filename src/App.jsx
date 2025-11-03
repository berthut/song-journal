import React, { useEffect, useState } from "react";
import './index.css'

const PRESET_MOODS = [
  "happy",
  "chill",
  "energetic",
  "sad",
  "nostalgic",
  "romantic",
  "angry",
  "focused",
  "dreamy",
  "inspired",
];

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (e) {
      console.error("useLocalStorage read error", e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error("useLocalStorage write error", e);
    }
  }, [key, state]);

  return [state, setState];
}

function extractSpotifyId(urlOrUri) {
  if (!urlOrUri) return null;
  const trackRegex = /(?:track[/:])([A-Za-z0-9]{22,})/i;
  const match = urlOrUri.match(trackRegex);
  if (match) return match[1];
  const idOnly = urlOrUri.trim();
  if (/^[A-Za-z0-9]{22,}$/.test(idOnly)) return idOnly;
  return null;
}

function EntryForm({ onAdd }) {
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [moodTags, setMoodTags] = useState([]);
  const [customMood, setCustomMood] = useState("");

async function handleSubmit(e) {
  e.preventDefault();
  const id = extractSpotifyId(link);
  if (!id) return alert("Please enter a valid Spotify track link.");

  let metadata = {};
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${link}`);
    if (res.ok) metadata = await res.json();
  } catch (err) {
    console.warn("Failed to fetch metadata", err);
  }
  
  const entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    mood: moodTags.join(", "),
    note,
    spotifyId: id,
    rawLink: link,
    title: metadata.title || "Unknown track",
    artist: metadata.author_name || "",
    thumbnail: metadata.thumbnail_url || null,
  };

  onAdd(entry);
  setLink("");
  setMoodTags([]);
  setCustomMood("");
  setNote("");
}

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <label>
        Spotify link or URI
        <input
          placeholder="https://open.spotify.com/track/... or spotify:track:..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />
      </label>

      <label>
        Mood / short tag (optional)
        <div className="mood-options">
          {PRESET_MOODS.map((m) => (
            <button
              type="button"
              key={m}
              className={`mood-btn ${moodTags.includes(m) ? "selected" : ""}`}
              onClick={() => {
                if (moodTags.includes(m)) {
                  setMoodTags(moodTags.filter(tag => tag !== m)); 
                } else {
                  setMoodTags([...moodTags, m]);
                }
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <input
          placeholder="Type your own mood and press Enter"
          value={customMood}
          onChange={(e) => setCustomMood(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customMood.trim()) {
              e.preventDefault();
              if (!moodTags.includes(customMood.trim())) {
              setMoodTags([...moodTags, customMood.trim()]);
            }
            setCustomMood("");
          }
          }}
        />
      </label>

      <label>
        Why this song reflects today
        <textarea
          rows={3}
          placeholder="A sentence or two — what's the vibe?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <div className="row">
        <button type="submit">Add entry</button>
      </div>
    </form>
  );
}

function EntryCard({ entry }) {
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

export default function App() {
  const [entries, setEntries] = useLocalStorage("songJournal.entries", []);

  function addEntry(entry) {
    setEntries([entry, ...entries]);
  }

  function clearAll() {
    if (!confirm("Clear all entries?")) return;
    setEntries([]);
  }

  const todayStr = new Date().toDateString();
  const todayEntry = entries.find((e) => new Date(e.date).toDateString() === todayStr);

  return (
    <div className="app-root">
      <header>
        <h1>🎧 Song Journal</h1>
        <p className="subtitle">Log a track & a short note about why it matches your day.</p>
      </header>

      <main>
        <section className="form-area">
          <EntryForm onAdd={addEntry} />
        </section>

        <section className="today-area">
          <h2>Today</h2>
          {todayEntry ? (
            <EntryCard entry={todayEntry} />
          ) : (
            <div className="empty">No entry yet for today — add one above!</div>
          )}
        </section>

        <section className="history-area">
          <div className="history-header">
            <h2>History</h2>
            <button className="ghost" onClick={clearAll} title="Clear local entries">
              Clear all
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="empty">No entries yet — your journal will appear here.</div>
          ) : (
            <div className="entry-list">
              {entries.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <small>Local demo — entries stored in your browser. No account needed.</small>
      </footer>

    </div>
  );
}
