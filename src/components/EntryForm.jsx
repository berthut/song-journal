import { useState } from "react";

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