import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Flame, ChevronRight, Quote, Plus, Image as ImageIcon, Video } from "lucide-react";
import { api, moodMeta, getMediaUrl } from "../App.jsx";
import { localDateISO, formatLocalDate, calculateStreak } from "../dateUtils.js";

const todayISO = localDateISO();

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState("good");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [hRes, eRes] = await Promise.all([
        api.get("/habits"),
        api.get("/entries")
      ]);
      setHabits(hRes.data || []);
      setEntries(eRes.data || []);

      const todayEntry = (eRes.data || []).find((x) => x.date === todayISO);
      if (todayEntry?.mood) {
        setMood(todayEntry.mood);
      }
      setError("");
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(err.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleHabit = async (id) => {
    try {
      const { data } = await api.patch(`/habits/${id}/toggle`, { date: todayISO });
      setHabits((prev) => prev.map((h) => (h._id === data._id ? data : h)));
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    }
  };

  const saveMood = async (value) => {
    setMood(value);
    try {
      const todayEntry = entries.find((x) => x.date === todayISO);
      await api.post("/entries", {
        date: todayISO,
        mood: value,
        journalText: todayEntry?.journalText || "",
        tags: todayEntry?.tags || []
      });
      loadData();
    } catch (err) {
      console.error("Failed to save mood check-in:", err);
    }
  };

  const completedCount = habits.filter((h) => h.completedDates?.includes(todayISO)).length;
  const habitPercent = habits.length ? Math.round((completedCount / habits.length) * 100) : 0;
  const todayEntry = entries.find((x) => x.date === todayISO);

  // Extract actual uploaded media from user's entries
  const recentMemories = useMemo(() => {
    const allMedia = [];
    entries.forEach((e) => {
      (e.media || []).forEach((m) => {
        if (m.url) {
          allMedia.push({ ...m, date: e.date });
        }
      });
    });
    return allMedia.slice(0, 6);
  }, [entries]);

  // Calculate real active streak
  const streakDays = useMemo(() => calculateStreak(entries, habits), [entries, habits]);

  return (
    <section className="page">
      <div className="hero-heading">
        <div>
          <span className="eyebrow">YOUR DAY</span>
          <h1>
            {greeting()}, {user?.name?.split(" ")[0] || "there"} <span>☀️</span>
          </h1>
          <p>{formatLocalDate(todayISO)}</p>
        </div>
        <div className="date-badge glass">
          <strong>{new Date().getDate()}</strong>
          <span>{new Date().toLocaleString(undefined, { month: "short" })}</span>
        </div>
      </div>

      {error && <div className="glass panel form-status">{error}</div>}

      <div className="dashboard-grid">
        {/* Mood Check-in */}
        <div className="glass panel mood-card">
          <div className="panel-top">
            <span>How do you feel today?</span>
            <span className="muted">Daily Check-in</span>
          </div>
          <div className="mood-row">
            {Object.entries(moodMeta).map(([key, m]) => (
              <button
                key={key}
                type="button"
                className={`mood-choice ${mood === key ? "selected" : ""}`}
                onClick={() => saveMood(key)}
              >
                <span>{m.emoji}</span>
                <small>{m.label}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Habit Progress & Active Streak */}
        <div className="glass panel habit-progress">
          <div className="panel-top">
            <span>Habit Progress</span>
            <span className="fire" title="Active Streak">
              <Flame size={18} /> {streakDays} day{streakDays === 1 ? "" : "s"} streak
            </span>
          </div>
          <div className="progress-body">
            <div className="ring" style={{ "--p": `${habitPercent}%` }}>
              <strong>
                {completedCount}/{habits.length || 0}
              </strong>
              <small>today</small>
            </div>
            <div className="mini-habits">
              {habits.slice(0, 6).map((h) => {
                const done = h.completedDates?.includes(todayISO);
                return (
                  <button key={h._id} type="button" onClick={() => toggleHabit(h._id)} className={done ? "done" : ""}>
                    <span className="check">
                      <Check size={13} />
                    </span>
                    {h.name}
                  </button>
                );
              })}
              {habits.length === 0 && (
                <span className="muted">No habits set up yet. Create your first habit on the Habits page.</span>
              )}
            </div>
          </div>
        </div>

        {/* Today's Journal Card */}
        <div className="glass panel journal-card">
          <div className="panel-top">
            <span>Today's Journal</span>
            <span className="muted">{todayEntry ? "Saved" : "Not written"}</span>
          </div>
          <p>{todayEntry?.journalText || "What made today meaningful? Write a few words and keep the moment."}</p>
          <button type="button" onClick={() => navigate("/journal")} className="text-link-button">
            {todayEntry ? "Edit journal entry" : "Write today's entry"} <ChevronRight size={15} />
          </button>
        </div>

        {/* Recent Memories (Actual MongoDB Uploads) */}
        <div className="glass panel memories-card">
          <div className="panel-top">
            <span>Recent Memories</span>
            <button type="button" onClick={() => navigate("/memories")} className="text-link-button">
              View all
            </button>
          </div>
          {recentMemories.length > 0 ? (
            <div className="memory-strip">
              {recentMemories.map((m, i) => (
                <div className="memory-strip-item" key={i}>
                  {m.type === "video" ? (
                    <>
                      <video
                        src={getMediaUrl(m.url)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <span className="video-badge"><Video size={11} /> Video</span>
                    </>
                  ) : (
                    <img
                      src={getMediaUrl(m.url)}
                      alt="Memory"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-memories-state">
              <ImageIcon size={24} opacity={0.5} />
              <p>No uploaded photos or videos yet.</p>
              <button type="button" onClick={() => navigate("/journal")} className="soft-button">
                <Plus size={15} /> Add memories in Journal
              </button>
            </div>
          )}
        </div>

        {/* Year at a Glance Card */}
        <div className="glass panel year-card">
          <div className="panel-top">
            <span>Year at a Glance</span>
            <button type="button" onClick={() => navigate("/calendar")} className="text-link-button">
              Open calendar →
            </button>
          </div>
          <YearSummary entries={entries} habits={habits} />
        </div>

        {/* Motivation Card */}
        <div className="glass panel quote-card">
          <Quote size={20} />
          <p>“The best view comes after the hardest climb.”</p>
          <small>— DayNest daily reminder</small>
        </div>
      </div>
    </section>
  );
}

function YearSummary({ entries = [], habits = [] }) {
  const currYear = new Date().getFullYear();

  const journalCountThisYear = useMemo(() => {
    return entries.filter((e) => {
      if (!e.date) return false;
      const y = Number(e.date.split("-")[0]);
      return y === currYear && e.journalText?.trim();
    }).length;
  }, [entries, currYear]);

  const activeHabitDaysCount = useMemo(() => {
    const dates = new Set();
    habits.forEach((h) => {
      (h.completedDates || []).forEach((d) => {
        if (d && Number(d.split("-")[0]) === currYear) {
          dates.add(d);
        }
      });
    });
    return dates.size;
  }, [habits, currYear]);

  const memoriesCountThisYear = useMemo(() => {
    let count = 0;
    entries.forEach((e) => {
      if (e.date && Number(e.date.split("-")[0]) === currYear) {
        count += e.media?.length || 0;
      }
    });
    return count;
  }, [entries, currYear]);

  const streakDays = useMemo(() => calculateStreak(entries, habits), [entries, habits]);

  return (
    <div className="year-summary-container">
      <div className="year-summary-grid">
        <div className="year-stat-box">
          <strong>{journalCountThisYear}</strong>
          <small>Journal Entries</small>
        </div>
        <div className="year-stat-box">
          <strong>{activeHabitDaysCount}</strong>
          <small>Active Habit Days</small>
        </div>
        <div className="year-stat-box">
          <strong>{memoriesCountThisYear}</strong>
          <small>Memories</small>
        </div>
        <div className="year-stat-box">
          <strong>{streakDays}</strong>
          <small>Current Streak</small>
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
