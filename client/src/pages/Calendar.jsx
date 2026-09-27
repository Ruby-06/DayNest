import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Plus, CheckCircle2, Grid, BarChart2 } from "lucide-react";
import { api, moodMeta, getMediaUrl } from "../App.jsx";
import { localDateISO, daysInYear, formatLocalDate } from "../dateUtils.js";

export default function Calendar() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const [entries, setEntries] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedDate, setSelectedDate] = useState(localDateISO());
  const [hoveredDayData, setHoveredDayData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("months"); // "months" | "heatmap"

  const todayISO = useMemo(() => localDateISO(), []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesRes, habitsRes] = await Promise.all([
        api.get("/entries"),
        api.get("/habits")
      ]);
      setEntries(entriesRes.data || []);
      setHabits(habitsRes.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load calendar data:", err);
      setError(err.response?.data?.message || "Could not load calendar data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const entriesByDate = useMemo(
    () => new Map(entries.map((e) => [e.date, e])),
    [entries]
  );

  const habitsByDate = useMemo(() => {
    const map = new Map();
    habits.forEach((h) => {
      (h.completedDates || []).forEach((d) => {
        if (!map.has(d)) map.set(d, []);
        map.get(d).push(h);
      });
    });
    return map;
  }, [habits]);

  // Generate 12 months structure for 12-Month View
  const monthList = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const firstDay = new Date(year, monthIdx, 1);
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
      const monthName = firstDay.toLocaleString(undefined, { month: "long" });

      const dayArray = [];
      for (let i = 0; i < startingDayOfWeek; i++) {
        dayArray.push(null);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, monthIdx, d);
        const iso = localDateISO(dateObj);
        dayArray.push({ dayNumber: d, iso, dateObj });
      }

      return { monthName, monthIdx, dayArray };
    });
  }, [year]);

  // Generate 12 months structure for Heatmap View (grouped cleanly with padded weekdays)
  const monthHeatmaps = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const firstDay = new Date(year, monthIdx, 1);
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      const startDayOfWeek = firstDay.getDay(); // 0 = Sun
      const monthName = firstDay.toLocaleString(undefined, { month: "short" });

      const days = [];
      for (let p = 0; p < startDayOfWeek; p++) {
        days.push(null);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, monthIdx, d);
        const iso = localDateISO(dateObj);
        days.push({ dayNumber: d, iso, dateObj });
      }
      return { monthName, monthIdx, days };
    });
  }, [year]);

  const weekDaysShort = ["S", "M", "T", "W", "T", "F", "S"];

  const selectedEntry = entriesByDate.get(selectedDate);
  const selectedHabits = habitsByDate.get(selectedDate) || [];

  return (
    <section className="page calendar-page">
      <div className="page-heading calendar-page-heading">
        <div>
          <span className="eyebrow">YOUR YEAR AT A GLANCE</span>
          <h1>{year} Calendar</h1>
          <p>Every day is a small square in the story of your year.</p>
        </div>

        {/* View Mode Switcher */}
        <div className="filter-tabs glass calendar-view-switcher">
          <button
            type="button"
            className={`filter-btn ${viewMode === "months" ? "active" : ""}`}
            onClick={() => setViewMode("months")}
          >
            <Grid size={14} /> 12 Months View
          </button>
          <button
            type="button"
            className={`filter-btn ${viewMode === "heatmap" ? "active" : ""}`}
            onClick={() => setViewMode("heatmap")}
          >
            <BarChart2 size={14} /> Heatmap View
          </button>
        </div>
      </div>

      {error && <div className="glass panel form-status">{error}</div>}

      {/* 12 Months View */}
      {viewMode === "months" && (
        <div className="full-year-months-grid">
          {monthList.map(({ monthName, monthIdx, dayArray }) => (
            <div className="glass month-card" key={monthIdx}>
              <div className="month-card-title">{monthName}</div>

              <div className="month-weekdays-header">
                {weekDaysShort.map((w, i) => (
                  <span key={i}>{w}</span>
                ))}
              </div>

              <div className="month-days-grid">
                {dayArray.map((item, idx) => {
                  if (!item) {
                    return <div className="month-day-cell empty-cell" key={`empty-${idx}`} />;
                  }

                  const { dayNumber, iso } = item;
                  const entry = entriesByDate.get(iso);
                  const habitsForDay = habitsByDate.get(iso) || [];
                  const completedHabitsCount = habitsForDay.length;
                  const hasJournal = Boolean(entry && entry.journalText?.trim());
                  const hasMood = Boolean(entry && entry.mood);
                  const hasMedia = Boolean(entry && entry.media && entry.media.length > 0);
                  const hasHabits = completedHabitsCount > 0;
                  const hasActivity = hasJournal || hasMood || hasHabits || hasMedia;

                  const isToday = iso === todayISO;
                  const isSelected = iso === selectedDate;

                  let cellClasses = "month-day-cell";
                  if (isToday) cellClasses += " is-today";
                  if (isSelected) cellClasses += " is-selected";
                  if (hasActivity) cellClasses += " has-activity";

                  return (
                    <button
                      type="button"
                      key={iso}
                      className={cellClasses}
                      onClick={() => setSelectedDate(iso)}
                      title={`${iso}${isToday ? " (Today)" : ""}${entry?.mood ? ` - Mood: ${entry.mood}` : ""}`}
                    >
                      <span className="day-number">{dayNumber}</span>

                      {/* Activity Dot Indicators */}
                      <div className="day-indicators">
                        {hasJournal && <span className="dot dot-journal" title="Journal Entry" />}
                        {hasHabits && <span className="dot dot-habit" title="Habit Activity" />}
                        {hasMood && <span className="dot dot-mood" title={`Mood: ${entry.mood}`} />}
                        {hasMedia && <span className="dot dot-media" title="Memory Media" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Polished Heatmap View */}
      {viewMode === "heatmap" && (
        <div className="glass panel heatmap-card">
          <div className="heatmap-scroll-container">
            <div className="heatmap-layout-wrapper">
              {/* Weekday labels column */}
              <div className="heatmap-weekdays-column">
                <div className="weekday-header-spacer" />
                {weekDaysShort.map((w, idx) => (
                  <span key={idx} className="heatmap-weekday-label">
                    {w}
                  </span>
                ))}
              </div>

              {/* 12 Month Heatmap Blocks */}
              <div className="heatmap-months-wrapper">
                {monthHeatmaps.map(({ monthName, monthIdx, days }) => (
                  <div className="heatmap-month-block" key={monthIdx}>
                    <div className="heatmap-month-title">{monthName}</div>
                    <div className="heatmap-days-matrix">
                      {days.map((item, dIdx) => {
                        if (!item) {
                          return <div key={`pad-${dIdx}`} className="heatmap-day-cell pad-cell" />;
                        }

                        const { dayNumber, iso } = item;
                        const entry = entriesByDate.get(iso);
                        const habitsForDay = habitsByDate.get(iso) || [];
                        const habitsCount = habitsForDay.length;
                        const hasJournal = Boolean(entry && entry.journalText?.trim());
                        const hasMood = Boolean(entry && entry.mood);
                        const mediaCount = entry?.media?.length || 0;

                        let score = 0;
                        if (hasJournal) score += 1;
                        if (hasMood) score += 1;
                        if (habitsCount > 0) score += 1;
                        if (mediaCount > 0) score += 1;

                        let level = "none";
                        if (score === 1) level = "low";
                        else if (score >= 2 && score <= 3) level = "med";
                        else if (score >= 4) level = "high";

                        const isToday = iso === todayISO;
                        const isSelected = iso === selectedDate;

                        let cellClasses = `heatmap-day-cell level-${level}`;
                        if (isToday) cellClasses += " is-today";
                        if (isSelected) cellClasses += " is-selected";

                        return (
                          <button
                            type="button"
                            key={iso}
                            className={cellClasses}
                            onClick={() => setSelectedDate(iso)}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPos({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8
                              });
                              setHoveredDayData({
                                iso,
                                dayNumber,
                                monthName,
                                level,
                                score,
                                entry,
                                habitsCount,
                                mediaCount,
                                isToday
                              });
                            }}
                            onMouseLeave={() => setHoveredDayData(null)}
                            aria-label={`${formatLocalDate(iso)}: Activity level ${level}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="heatmap-footer-row">
            <small className="heatmap-calc-hint">
              Activity = Journal + Habits + Mood + Memories
            </small>
            <div className="heatmap-legend-items">
              <span className="legend-label">Activity Level:</span>
              <span className="legend-box level-none">None</span>
              <span className="legend-box level-low">Low</span>
              <span className="legend-box level-med">Medium</span>
              <span className="legend-box level-high">High</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Glass Tooltip for Heatmap */}
      {hoveredDayData && (
        <div
          className="heatmap-tooltip glass"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`
          }}
        >
          <div className="tooltip-title">
            <strong>{formatLocalDate(hoveredDayData.iso)}</strong>
            {hoveredDayData.isToday && <span className="tooltip-today-badge">Today</span>}
          </div>
          <div className="tooltip-details">
            <span className="tooltip-line">
              <strong>Activity:</strong> {hoveredDayData.level.toUpperCase()} ({hoveredDayData.score} item{hoveredDayData.score !== 1 ? "s" : ""})
            </span>
            {hoveredDayData.entry?.mood && (
              <span className="tooltip-line">
                <strong>Mood:</strong> {moodMeta[hoveredDayData.entry.mood]?.emoji} {moodMeta[hoveredDayData.entry.mood]?.label || hoveredDayData.entry.mood}
              </span>
            )}
            <span className="tooltip-line">
              <strong>Journal:</strong> {hoveredDayData.entry?.journalText?.trim() ? "Written" : "None"}
            </span>
            <span className="tooltip-line">
              <strong>Habits:</strong> {hoveredDayData.habitsCount} completed
            </span>
            {hoveredDayData.mediaCount > 0 && (
              <span className="tooltip-line">
                <strong>Memories:</strong> {hoveredDayData.mediaCount} photo/video
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selected Day Details Panel */}
      <div className="glass panel selected-day-panel compact-selected-panel">
        <div className="selected-day-head">
          <div>
            <span className="eyebrow">SELECTED DATE</span>
            <h2>{formatLocalDate(selectedDate)}</h2>
            {selectedDate === todayISO && <span className="today-badge">Today</span>}
          </div>

          <div className="selected-day-actions">
            {selectedEntry ? (
              <button
                className="daynest-glass-button"
                onClick={() => navigate(`/journal?date=${selectedDate}`)}
              >
                <Edit3 size={15} /> Edit Entry
              </button>
            ) : (
              <button
                className="daynest-glass-button"
                onClick={() => navigate(`/journal?date=${selectedDate}`)}
              >
                <Plus size={15} /> Write Journal Entry
              </button>
            )}
          </div>
        </div>

        {/* Compact Details Section */}
        {selectedEntry || selectedHabits.length > 0 ? (
          <div className="compact-details-grid">
            {selectedEntry?.mood && (
              <div className="compact-detail-row">
                <span className="detail-label">Mood:</span>
                <div className="selected-mood-badge inline">
                  <span>{moodMeta[selectedEntry.mood]?.emoji}</span>
                  <strong>Feeling {moodMeta[selectedEntry.mood]?.label || selectedEntry.mood}</strong>
                </div>
              </div>
            )}

            {selectedEntry?.journalText && (
              <div className="compact-detail-row">
                <span className="detail-label">Journal:</span>
                <p className="journal-text-preview compact">"{selectedEntry.journalText}"</p>
              </div>
            )}

            <div className="compact-detail-row">
              <span className="detail-label">Habits:</span>
              <div className="detail-value">
                <span>{selectedHabits.length} / {habits.length || 0} completed</span>
                {selectedHabits.length > 0 && (
                  <div className="completed-habits-inline">
                    {selectedHabits.map((h) => (
                      <span className="completed-habit-chip" key={h._id}>
                        <CheckCircle2 size={13} /> {h.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="compact-detail-row">
              <span className="detail-label">Memories:</span>
              <span className="detail-value">
                {selectedEntry?.media?.length || 0} photo/video memory
              </span>
            </div>

            {selectedEntry?.media?.length > 0 && (
              <div className="uploaded-media-container compact">
                <div className="journal-media-grid compact">
                  {selectedEntry.media.map((m, i) => (
                    <div key={i} className="media-tile compact">
                      {m.type === "video" ? (
                        <video src={getMediaUrl(m.url)} controls />
                      ) : (
                        <img src={getMediaUrl(m.url)} alt="Memory photo" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-entry-state">
            <p>No activity recorded for this day yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}



