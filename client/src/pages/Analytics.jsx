import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BookOpen, CheckSquare, Image as ImageIcon, Video, Sparkles, TrendingUp, Calendar, Clock } from "lucide-react";
import { api, moodMeta } from "../App.jsx";
import { localDateISO, formatLocalDate, calculateStreak } from "../dateUtils.js";

const moodValueMap = { awful: 1, low: 2, okay: 3, good: 4, great: 5 };

export default function Analytics() {
  const [entries, setEntries] = useState([]);
  const [habits, setHabits] = useState([]);
  const [filter, setFilter] = useState("all"); // "7d" | "30d" | "3m" | "year" | "all"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eRes, hRes] = await Promise.all([
          api.get("/entries"),
          api.get("/habits")
        ]);
        setEntries(eRes.data || []);
        setHabits(hRes.data || []);
        setError("");
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError(err.response?.data?.message || "Could not load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute cutoff date string based on filter selection
  const cutoffDate = useMemo(() => {
    const now = new Date();
    if (filter === "7d") {
      now.setDate(now.getDate() - 7);
    } else if (filter === "30d") {
      now.setDate(now.getDate() - 30);
    } else if (filter === "3m") {
      now.setMonth(now.getMonth() - 3);
    } else if (filter === "year") {
      return `${now.getFullYear()}-01-01`;
    } else if (filter === "all") {
      return null;
    }
    return localDateISO(now);
  }, [filter]);

  // Filter entries based on cutoff date
  const filteredEntries = useMemo(() => {
    if (!cutoffDate) return entries;
    return entries.filter((e) => e.date && e.date >= cutoffDate);
  }, [entries, cutoffDate]);

  // Filter habits based on cutoff date
  const filteredHabits = useMemo(() => {
    if (!cutoffDate) return habits;
    return habits.map((h) => ({
      ...h,
      completedDates: (h.completedDates || []).filter((d) => d >= cutoffDate)
    }));
  }, [habits, cutoffDate]);

  // Filtered Summary Counts (100% Real Data)
  const daysJournaledCount = useMemo(() => {
    return filteredEntries.filter((e) => e.journalText?.trim() || e.mood).length;
  }, [filteredEntries]);

  const photosCount = useMemo(() => {
    return filteredEntries.reduce(
      (acc, e) => acc + (e.media?.filter((m) => m.type === "image").length || 0),
      0
    );
  }, [filteredEntries]);

  const videosCount = useMemo(() => {
    return filteredEntries.reduce(
      (acc, e) => acc + (e.media?.filter((m) => m.type === "video").length || 0),
      0
    );
  }, [filteredEntries]);

  const habitCompletionsCount = useMemo(() => {
    return filteredHabits.reduce(
      (acc, h) => acc + (h.completedDates?.length || 0),
      0
    );
  }, [filteredHabits]);

  // Chronological chart data points
  const chartData = useMemo(() => {
    return filteredEntries
      .filter((e) => e.date && e.mood && moodValueMap[e.mood])
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        fullDate: e.date,
        displayDate: e.date.slice(5),
        moodScore: moodValueMap[e.mood],
        moodKey: e.mood,
        emoji: moodMeta[e.mood]?.emoji || "•",
        label: moodMeta[e.mood]?.label || e.mood
      }));
  }, [filteredEntries]);

  // Average mood calculation
  const avgMoodScore = useMemo(() => {
    const scores = filteredEntries.map((e) => moodValueMap[e.mood]).filter(Boolean);
    if (!scores.length) return null;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  }, [filteredEntries]);

  // Journal Average Word Count
  const avgWordsPerEntry = useMemo(() => {
    const textEntries = filteredEntries.filter((e) => e.journalText?.trim());
    if (!textEntries.length) return 0;
    const totalWords = textEntries.reduce((acc, e) => {
      const words = e.journalText.trim().split(/\s+/).filter(Boolean).length;
      return acc + words;
    }, 0);
    return Math.round(totalWords / textEntries.length);
  }, [filteredEntries]);

  // Habit completion rate
  const completionRatePercent = useMemo(() => {
    if (!habits.length) return 0;
    let daysCount = 30;
    if (filter === "7d") daysCount = 7;
    else if (filter === "30d") daysCount = 30;
    else if (filter === "3m") daysCount = 90;
    else if (filter === "year" || filter === "all") daysCount = 30;

    const totalPossibleSlots = habits.length * daysCount;
    return Math.min(100, Math.round((habitCompletionsCount / Math.max(1, totalPossibleSlots)) * 100));
  }, [habits, habitCompletionsCount, filter]);

  // Streak calculation
  const streakDays = useMemo(() => calculateStreak(entries, habits), [entries, habits]);

  // Dynamic real-data insight
  const dynamicInsight = useMemo(() => {
    if (!filteredEntries.length && !habitCompletionsCount) {
      return {
        title: "Start your journey",
        text: "Keep checking in consistently and DayNest will reveal your mood, journal, and habit patterns over time."
      };
    }
    if (avgMoodScore) {
      return {
        title: `Average mood is ${avgMoodScore} / 5`,
        text: `You have journaled on ${daysJournaledCount} day${daysJournaledCount === 1 ? "" : "s"} and completed ${habitCompletionsCount} habit check-in${habitCompletionsCount === 1 ? "" : "s"} during this period.`
      };
    }
    return {
      title: "Building consistent habits",
      text: `You recorded ${habitCompletionsCount} habit check-in${habitCompletionsCount === 1 ? "" : "s"} and ${daysJournaledCount} journal entry${daysJournaledCount === 1 ? "" : "s"}.`
    };
  }, [filteredEntries, daysJournaledCount, habitCompletionsCount, avgMoodScore]);

  return (
    <section className="page analytics-page">
      {/* Header + Date Filter Tabs */}
      <div className="page-heading analytics-heading">
        <div>
          <span className="eyebrow">YOUR PATTERNS</span>
          <h1>Analytics</h1>
          <p>Look back and notice what helps you feel your best.</p>
        </div>

        {/* Date Filter Tabs */}
        <div className="filter-tabs glass analytics-filter-tabs">
          <button
            type="button"
            className={`filter-btn ${filter === "7d" ? "active" : ""}`}
            onClick={() => setFilter("7d")}
          >
            7 Days
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "30d" ? "active" : ""}`}
            onClick={() => setFilter("30d")}
          >
            30 Days
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "3m" ? "active" : ""}`}
            onClick={() => setFilter("3m")}
          >
            3 Months
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "year" ? "active" : ""}`}
            onClick={() => setFilter("year")}
          >
            This Year
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Time
          </button>
        </div>
      </div>

      {error && <div className="glass panel form-status">{error}</div>}

      {/* Summary Stat Cards Grid */}
      <div className="stats-grid analytics-stats-grid">
        <div className="glass stat-card">
          <small>Days journaled</small>
          <strong>{daysJournaledCount}</strong>
        </div>
        <div className="glass stat-card">
          <small>Photos saved</small>
          <strong>{photosCount}</strong>
        </div>
        <div className="glass stat-card">
          <small>Videos saved</small>
          <strong>{videosCount}</strong>
        </div>
        <div className="glass stat-card">
          <small>Habit completions</small>
          <strong>{habitCompletionsCount}</strong>
        </div>
      </div>

      {/* Mood Journey Chart Panel */}
      <div className="glass panel chart-panel analytics-chart-panel">
        <div className="panel-top">
          <div className="chart-panel-header">
            <span>Mood journey</span>
            {avgMoodScore && <span className="avg-badge">Avg: {avgMoodScore} / 5</span>}
          </div>
          <span className="pill glass">1–5 Mood Scale</span>
        </div>

        {chartData.length > 0 ? (
          <>
            <div className="chart">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="displayDate" stroke="#43617a" fontSize={11} />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    stroke="#43617a"
                    fontSize={10}
                    tickFormatter={(val) => {
                      const map = { 1: "Awful", 2: "Low", 3: "Okay", 4: "Good", 5: "Great" };
                      return map[val] || val;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="moodScore"
                    stroke="#3182ce"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#ffffff", stroke: "#3182ce", strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: "#3182ce" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scale Legend Explanation */}
            <div className="mood-scale-explanation">
              <span className="scale-item"><span className="dot dot-1" /> 1 — Awful</span>
              <span className="scale-item"><span className="dot dot-2" /> 2 — Low</span>
              <span className="scale-item"><span className="dot dot-3" /> 3 — Okay</span>
              <span className="scale-item"><span className="dot dot-4" /> 4 — Good</span>
              <span className="scale-item"><span className="dot dot-5" /> 5 — Great</span>
            </div>
          </>
        ) : (
          <div className="empty-chart-state">
            <p>No mood entries recorded for this time range.</p>
            <small>Record your mood in Journal to see your journey mapped here.</small>
          </div>
        )}
      </div>

      {/* Secondary Analytics 2-Column Grid */}
      <div className="analytics-grid-2col">
        {/* Habit Progress Card */}
        <div className="glass panel analytics-subcard">
          <div className="panel-top">
            <div className="card-title-with-icon">
              <CheckSquare size={16} className="card-icon" />
              <span>Habit Progress</span>
            </div>
            <span className="muted">{habitCompletionsCount} completed</span>
          </div>

          <div className="habit-analytics-body">
            <div className="habit-progress-header">
              <span>Completion Rate</span>
              <strong>{completionRatePercent}%</strong>
            </div>
            <div className="habit-progress-bar-bg">
              <div
                className="habit-progress-bar-fill"
                style={{ width: `${completionRatePercent}%` }}
              />
            </div>

            {habits.length > 0 ? (
              <div className="habits-breakdown-list">
                {habits.slice(0, 4).map((h) => {
                  const count = (h.completedDates || []).filter(
                    (d) => !cutoffDate || d >= cutoffDate
                  ).length;
                  return (
                    <div className="habit-breakdown-row" key={h._id}>
                      <span className="habit-name">{h.name}</span>
                      <span className="habit-count-badge">{count} completions</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-sub-state">
                <small>No habit activity recorded yet.</small>
              </div>
            )}
          </div>
        </div>

        {/* Journal Activity Card */}
        <div className="glass panel analytics-subcard">
          <div className="panel-top">
            <div className="card-title-with-icon">
              <BookOpen size={16} className="card-icon" />
              <span>Journal Activity</span>
            </div>
            <span className="muted">{daysJournaledCount} entries</span>
          </div>

          <div className="journal-analytics-body">
            <div className="journal-stat-row">
              <div>
                <small>Average Words / Entry</small>
                <strong>{avgWordsPerEntry} words</strong>
              </div>
              <div>
                <small>Current Streak</small>
                <strong>{streakDays} days</strong>
              </div>
            </div>

            {filteredEntries.length > 0 ? (
              <div className="journal-recent-hint">
                <Clock size={13} />
                <span>Last entry recorded on {formatLocalDate(filteredEntries[0].date)}</span>
              </div>
            ) : (
              <div className="empty-sub-state">
                <small>No journal entries in this date range.</small>
              </div>
            )}
          </div>
        </div>

        {/* Memory & Media Card */}
        <div className="glass panel analytics-subcard">
          <div className="panel-top">
            <div className="card-title-with-icon">
              <ImageIcon size={16} className="card-icon" />
              <span>Memories & Media</span>
            </div>
            <span className="muted">{photosCount + videosCount} total</span>
          </div>

          <div className="memory-analytics-body">
            <div className="memory-stat-grid">
              <div className="memory-mini-box">
                <ImageIcon size={16} />
                <div>
                  <strong>{photosCount}</strong>
                  <small>Photos</small>
                </div>
              </div>

              <div className="memory-mini-box">
                <Video size={16} />
                <div>
                  <strong>{videosCount}</strong>
                  <small>Videos</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Quick Insight Card */}
        <div className="glass panel analytics-subcard insight-card">
          <div className="panel-top">
            <div className="card-title-with-icon">
              <Sparkles size={16} className="card-icon insight-sparkle" />
              <span className="eyebrow">QUICK INSIGHT</span>
            </div>
          </div>

          <div className="insight-body">
            <h2>{dynamicInsight.title}</h2>
            <p>{dynamicInsight.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Custom Tooltip for Recharts Line Chart */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass chart-tooltip">
        <div className="tooltip-date">
          <strong>{formatLocalDate(data.fullDate)}</strong>
        </div>
        <div className="tooltip-row">
          <span>Mood:</span>
          <strong>{data.emoji} {data.label}</strong>
        </div>
        <div className="tooltip-row">
          <span>Score:</span>
          <strong>{data.moodScore} / 5</strong>
        </div>
      </div>
    );
  }
  return null;
}

