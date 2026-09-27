import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Check, Flame, MoreVertical, Sparkles, Calendar, CheckCircle2 } from "lucide-react";
import { api } from "../App.jsx";
import { localDateISO, formatLocalDate } from "../dateUtils.js";

// Helper to compute individual habit streak
const calculateHabitStreak = (completedDates, todayISO) => {
  if (!completedDates || !completedDates.length) return 0;
  const set = new Set(completedDates);
  let streak = 0;
  let curr = new Date(todayISO);

  if (set.has(todayISO)) {
    streak++;
    curr.setDate(curr.getDate() - 1);
  } else {
    const yesterday = new Date(curr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yISO = localDateISO(yesterday);
    if (!set.has(yISO)) return 0;
    curr = yesterday;
  }

  while (true) {
    const iso = localDateISO(curr);
    if (set.has(iso)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

// Helper to get emoji & description based on habit name
const getHabitDetails = (name, icon) => {
  const lower = name.toLowerCase();
  if (lower.includes("water") || lower.includes("hydrate")) {
    return { emoji: "💧", desc: "Drink water and stay healthy" };
  }
  if (lower.includes("read") || lower.includes("book")) {
    return { emoji: "📚", desc: "Read daily to expand your mind" };
  }
  if (lower.includes("exercise") || lower.includes("workout") || lower.includes("gym") || lower.includes("run")) {
    return { emoji: "🏃", desc: "Keep your body active and strong" };
  }
  if (lower.includes("meditate") || lower.includes("mind") || lower.includes("peace")) {
    return { emoji: "🧘", desc: "Practice mindfulness and focus" };
  }
  if (lower.includes("code") || lower.includes("dev") || lower.includes("program")) {
    return { emoji: "💻", desc: "Build & practice coding skills" };
  }
  if (lower.includes("walk") || lower.includes("step")) {
    return { emoji: "🚶", desc: "Daily walking & movement" };
  }
  if (lower.includes("sleep") || lower.includes("bed")) {
    return { emoji: "😴", desc: "Rest well and recover daily" };
  }
  return { emoji: icon && icon !== "✓" ? icon : "🎯", desc: "Stay consistent and build your routine" };
};

// Motivational text lookup
const getMotivationalText = (percent) => {
  if (percent === 100) return "Great job! Keep it up!";
  if (percent >= 75) return "Almost there! Finish strong!";
  if (percent >= 50) return "Halfway done! Keep going!";
  if (percent > 0) return "Good start! You've got this!";
  return "Ready to start your day?";
};

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const today = localDateISO();

  const loadHabits = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/habits");
      setHabits(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load habits:", err);
      setError(err.response?.data?.message || "Could not load habits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post("/habits", { name: name.trim(), icon: "✓" });
      setName("");
      await loadHabits();
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.error("Failed to add habit:", err);
      setError(err.response?.data?.message || "Could not add habit.");
    }
  };

  const toggleHabit = async (id) => {
    try {
      const { data } = await api.patch(`/habits/${id}/toggle`, { date: today });
      setHabits((prev) => prev.map((h) => (h._id === id ? data : h)));
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.error("Failed to toggle habit:", err);
      setError(err.response?.data?.message || "Could not toggle habit status.");
    }
  };


  const removeHabit = async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Failed to delete habit:", err);
      setError(err.response?.data?.message || "Could not delete habit.");
    }
  };

  // Computations
  const completedTodayCount = useMemo(
    () => habits.filter((h) => h.completedDates?.includes(today)).length,
    [habits, today]
  );

  const todayPercent = useMemo(
    () => (habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0),
    [completedTodayCount, habits]
  );

  // Last 7 days ending on today
  const last7Days = useMemo(() => {
    const days = [];
    const base = new Date(today);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const iso = localDateISO(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const isToday = iso === today;
      days.push({ iso, dayName, isToday });
    }
    return days;
  }, [today]);

  const completedDaysInWeekCount = useMemo(() => {
    return last7Days.filter((d) => habits.some((h) => h.completedDates?.includes(d.iso))).length;
  }, [last7Days, habits]);

  const overallStreak = useMemo(() => {
    if (!habits.length) return 0;
    return Math.max(...habits.map((h) => calculateHabitStreak(h.completedDates, today)), 0);
  }, [habits, today]);

  return (
    <section className="page habits-page">
      {/* 1. Page Header */}
      <div className="habits-header-row">
        <div>
          <span className="eyebrow">BUILD CONSISTENCY</span>
          <h1>My Habits</h1>
          <p>Small actions, repeated often, become your life.</p>
        </div>

        <div className="glass date-badge-card">
          <Calendar size={15} className="date-icon" />
          <div>
            <strong>Today</strong>
            <small>{formatLocalDate(today)}</small>
          </div>
        </div>
      </div>

      {error && <div className="glass panel form-status">{error}</div>}

      {/* Top 2-Column Progress & Consistency Cards */}
      <div className="habits-summary-grid">
        {/* 2. Today's Progress Card */}
        <div className="glass panel habit-summary-card">
          <div className="card-head-sm">
            <Sparkles size={16} />
            <span>Today's Progress</span>
          </div>
          <div className="progress-card-body">
            <div className="ring-large" style={{ "--p": `${todayPercent}%` }}>
              <strong>{todayPercent}%</strong>
            </div>
            <div className="progress-details">
              <h3>
                {completedTodayCount} of {habits.length} habits complete
              </h3>
              <p className="motivational-text">{getMotivationalText(todayPercent)}</p>
            </div>
          </div>
        </div>

        {/* 3. Weekly Consistency Card */}
        <div className="glass panel habit-summary-card">
          <div className="card-head-sm">
            <Calendar size={16} />
            <span>Weekly consistency</span>
          </div>
          <div className="consistency-card-body">
            <div className="consistency-head">
              <strong>{completedDaysInWeekCount} of 7 days</strong>
              <div className="streak-badge-header">
                <Flame size={15} /> {overallStreak} day streak
              </div>
            </div>

            <div className="week-indicators-row">
              {last7Days.map((d) => {
                const isCompleted = habits.some((h) => h.completedDates?.includes(d.iso));
                return (
                  <div key={d.iso} className={`week-bubble ${isCompleted ? "completed" : ""} ${d.isToday ? "is-today" : ""}`}>
                    <span className="week-bubble-day">{d.dayName}</span>
                    <span className="week-bubble-icon">{isCompleted ? <Check size={11} /> : "○"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Redesigned "Your Habits" Section */}
      <div className="habits-section">
        <div className="section-head">
          <h2>Your Habits</h2>
          <span className="pill">{completedTodayCount}/{habits.length} Done Today</span>
        </div>

        {habits.length > 0 ? (
          <div className="habits-cards-list">
            {habits.map((h) => {
              const isCompletedToday = h.completedDates?.includes(today);
              const streak = calculateHabitStreak(h.completedDates, today);
              const details = getHabitDetails(h.name, h.icon);
              const isMenuOpen = activeMenuId === h._id;

              return (
                <div key={h._id} className={`glass habit-card ${isCompletedToday ? "is-done" : ""}`}>
                  <div className="habit-card-top">
                    <button
                      type="button"
                      className={`habit-checkbox ${isCompletedToday ? "checked" : ""}`}
                      onClick={() => toggleHabit(h._id)}
                      title={isCompletedToday ? "Mark as incomplete" : "Mark as complete"}
                    >
                      <Check size={16} />
                    </button>

                    <div className="habit-avatar-badge">{details.emoji}</div>

                    <div className="habit-main-title">
                      <h3>{h.name}</h3>
                      <p>{details.desc}</p>
                    </div>

                    <div className="habit-menu-container">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : h._id)}
                        title="Habit options"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {isMenuOpen && (
                        <div className="glass habit-dropdown-menu">
                          <button
                            type="button"
                            className="dropdown-item danger"
                            onClick={() => removeHabit(h._id)}
                          >
                            <Trash2 size={14} /> Delete Habit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="habit-card-meta">
                    <span className="habit-meta-pill">
                      <Flame size={14} /> {streak} day streak
                    </span>
                    <span className="habit-meta-pill">
                      <CheckCircle2 size={14} /> {isCompletedToday ? "1/1 today" : "0/1 today"}
                    </span>
                  </div>

                  {/* Weekly 7-day indicators for this habit */}
                  <div className="habit-week-strip">
                    {last7Days.map((d) => {
                      const isDone = h.completedDates?.includes(d.iso);
                      return (
                        <div key={d.iso} className={`habit-week-col ${d.isToday ? "is-today" : ""}`}>
                          <span className="week-col-name">{d.dayName}</span>
                          <span className={`week-col-dot ${isDone ? "done" : ""}`}>
                            {isDone ? <Check size={12} /> : "○"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !loading && (
            <div className="glass panel empty-habits-state">
              <Sparkles size={36} opacity={0.5} />
              <h3>No habits created yet</h3>
              <p>Start small! Create your first habit below to build daily consistency.</p>
            </div>
          )
        )}
      </div>

      {/* 6. Create a Habit Section */}
      <form className="glass panel add-habit-card" onSubmit={addHabit}>
        <span className="eyebrow">NEW HABIT</span>
        <h2>Create a habit</h2>
        <div className="add-habit-input-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read 20 minutes, Exercise, Meditate..."
            required
          />
          <button className="primary-button add-btn" type="submit">
            <Plus size={18} /> Add habit
          </button>
        </div>
      </form>
    </section>
  );
}
