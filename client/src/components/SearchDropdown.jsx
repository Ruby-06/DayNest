import React from "react";
import { BookOpen, Images, CheckCircle2, Calendar, Loader2, Search } from "lucide-react";
import { formatLocalDate } from "../dateUtils.js";

export default function SearchDropdown({ results, loading, query, onSelectResult }) {
  const { journals = [], memories = [], habits = [], dates = [] } = results || {};
  const hasResults = journals.length > 0 || memories.length > 0 || habits.length > 0 || dates.length > 0;

  return (
    <div className="search-dropdown-panel glass" role="region" aria-label="Search results">
      {loading ? (
        <div className="search-state-box">
          <Loader2 size={18} className="spin-icon" />
          <span>Searching DayNest...</span>
        </div>
      ) : !hasResults ? (
        <div className="search-state-box empty">
          <Search size={22} opacity={0.4} />
          <strong>No results found</strong>
          <small>Try searching for a journal, memory, habit, or date.</small>
        </div>
      ) : (
        <div className="search-results-list">
          {/* 1. JOURNALS */}
          {journals.length > 0 && (
            <div className="search-group">
              <div className="search-group-header">
                <BookOpen size={13} />
                <span>JOURNAL</span>
              </div>
              {journals.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onClick={() => onSelectResult(item.targetPath)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="search-item-title-row">
                    <span className="search-item-title">📖 {item.snippet || "Journal entry"}</span>
                    <span className="search-item-date">{formatLocalDate(item.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. MEMORIES */}
          {memories.length > 0 && (
            <div className="search-group">
              <div className="search-group-header">
                <Images size={13} />
                <span>MEMORIES</span>
              </div>
              {memories.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onClick={() => onSelectResult(item.targetPath)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="search-item-title-row">
                    <span className="search-item-title">🖼️ {item.snippet || "Memory entry"}</span>
                    <span className="search-item-date">{formatLocalDate(item.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. HABITS */}
          {habits.length > 0 && (
            <div className="search-group">
              <div className="search-group-header">
                <CheckCircle2 size={13} />
                <span>HABITS</span>
              </div>
              {habits.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onClick={() => onSelectResult(item.targetPath)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="search-item-title-row">
                    <span className="search-item-title">{item.icon} {item.name}</span>
                    <span className="search-item-date">{item.completedCount} completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. DATES */}
          {dates.length > 0 && (
            <div className="search-group">
              <div className="search-group-header">
                <Calendar size={13} />
                <span>DATES</span>
              </div>
              {dates.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onClick={() => onSelectResult(item.targetPath)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="search-item-title-row">
                    <span className="search-item-title">📅 {formatLocalDate(item.date)}</span>
                    <span className="search-item-date">View Calendar</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
