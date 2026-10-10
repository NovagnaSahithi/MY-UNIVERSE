import { useEffect, useState } from "react";

function Journal() {
  const [journals, setJournals] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const moods = [
    { value: "happy", emoji: "☀️", label: "Happy" },
    { value: "calm", emoji: "🌙", label: "Calm" },
    { value: "sad", emoji: "🌧️", label: "Sad" },
    { value: "angry", emoji: "🔥", label: "Angry" },
    { value: "excited", emoji: "✨", label: "Excited" },
    { value: "emotional", emoji: "🥹", label: "Emotional" },
    { value: "stressed", emoji: "☁️", label: "Stressed" },
    { value: "grateful", emoji: "🤍", label: "Grateful" },
    { value: "neutral", emoji: "✦", label: "Neutral" },
  ];

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/journal",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setJournals(data.journals);
      } else {
        setMessage(data.message || "Could not load your journal.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to your universe.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Give your entry a title and something to say ✦");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/journal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content,
            mood,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setJournals((previous) => [
          data.journal,
          ...previous,
        ]);

        setTitle("");
        setContent("");
        setMood("neutral");

        setMessage("Your thoughts have been saved ✦");
      } else {
        setMessage(
          data.message || "Could not save your journal entry."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to your universe.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMood = (moodValue) => {
    return moods.find((item) => item.value === moodValue) || moods[8];
  };

  return (
    <div className="journal-page">

      <div className="journal-header">
        <p className="journal-eyebrow">A LITTLE SPACE FOR YOU</p>

        <h1>My Journal ✎</h1>

        <p>
          Thoughts, feelings, little moments...
          <br />
          They all have a place here.
        </p>
      </div>

      <div className="journal-create">

        <form onSubmit={handleSave}>

          <div className="journal-field">
            <label>What's on your mind?</label>

            <input
              type="text"
              placeholder="Give this moment a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="journal-field">
            <textarea
              placeholder="Write whatever you want. This is your space..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="journal-mood">

            <p>How are you feeling?</p>

            <div className="mood-options">
              {moods.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={
                    mood === item.value
                      ? "mood-button selected"
                      : "mood-button"
                  }
                  onClick={() => setMood(item.value)}
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </div>

          </div>

          <button
            type="submit"
            className="journal-save"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save to my universe ✦"}
          </button>

        </form>

        {message && (
          <p className="journal-message">
            {message}
          </p>
        )}

      </div>

      <div className="journal-list">

        <div className="journal-list-header">
          <h2>Little pieces of my universe</h2>
          <span>{journals.length} entries</span>
        </div>

        {loading ? (
          <p className="journal-empty">
            Looking through your stars...
          </p>
        ) : journals.length === 0 ? (
          <div className="journal-empty">
            <span>✦</span>

            <p>
              Nothing here yet.
              <br />
              Your first thought can become your first star.
            </p>
          </div>
        ) : (
          <div className="journal-entries">

            {journals.map((journal) => {
              const selectedMood = getMood(journal.mood);

              return (
                <article
                  className="journal-card"
                  key={journal._id}
                >
                  <div className="journal-card-top">

                    <span className="journal-date">
                      {formatDate(journal.createdAt)}
                    </span>

                    <span className="journal-card-mood">
                      {selectedMood.emoji}
                    </span>

                  </div>

                  <h3>{journal.title}</h3>

                  <p>{journal.content}</p>

                  <div className="journal-card-bottom">
                    {selectedMood.label}
                  </div>
                </article>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default Journal;