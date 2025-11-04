import './index.css'
import useLocalStorage from "./components/useLocalStorage";
import EntryForm from "./components/EntryForm";
import EntryCard from "./components/EntryCard";

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
