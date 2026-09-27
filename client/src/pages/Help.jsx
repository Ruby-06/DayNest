import React, { useState } from "react";
import {
  Search, BookOpen, CheckSquare, Calendar, Sparkles, User, Settings,
  HelpCircle, ChevronRight, X, Info, MessageSquare, AlertCircle
} from "lucide-react";

export const helpArticles = [
  // GETTING STARTED
  {
    id: "getting-started-overview",
    category: "GETTING STARTED",
    title: "How to use DayNest",
    summary: "An overview of DayNest features to build daily consistency and track your memories.",
    content: [
      "DayNest helps you track daily habits, write journal reflections, save photo/video memories, and analyze your mood trends.",
      "Use the sidebar to navigate between your Dashboard, Calendar, Habits, Journal, Memories, Analytics, and Settings.",
      "Your data is securely stored and synced across your account in real-time."
    ]
  },
  {
    id: "getting-started-first-habit",
    category: "GETTING STARTED",
    title: "Creating your first habit",
    summary: "Learn how to define custom daily habits and track consistency.",
    content: [
      "1. Navigate to the 'Habits' page from the sidebar.",
      "2. Under 'Create a habit', type your habit name (e.g. Read 20 mins, Exercise, Meditate).",
      "3. Click 'Add habit'.",
      "4. Click the check box on any habit card to mark it complete for today."
    ]
  },
  {
    id: "getting-started-journal-entry",
    category: "GETTING STARTED",
    title: "Adding a journal entry",
    summary: "Record daily notes, mood selections, and custom tags.",
    content: [
      "1. Go to the 'Journal' page or click the '+' button in the top bar.",
      "2. Pick a date using the date navigation buttons.",
      "3. Choose your current mood (Awful, Low, Okay, Good, Great).",
      "4. Write your thoughts in the text editor and add tags (e.g., #productivity, #family).",
      "5. Click 'Save Entry'."
    ]
  },
  {
    id: "getting-started-media-upload",
    category: "GETTING STARTED",
    title: "Adding photos and videos",
    summary: "Attach high-resolution photos and video clips to your daily journal entries.",
    content: [
      "1. On the Journal page, click 'Upload Photos' or 'Upload Videos'.",
      "2. Select media files from your device.",
      "3. Click 'Save Entry' to upload and attach them.",
      "4. View all your uploaded media anytime on the 'Memories' page."
    ]
  },
  {
    id: "getting-started-calendar-nav",
    category: "GETTING STARTED",
    title: "Understanding the calendar",
    summary: "How to navigate the 12-month calendar and heatmap consistency view.",
    content: [
      "1. Go to the 'Calendar' page.",
      "2. Use '12 Months View' for a month-by-month grid of the entire year.",
      "3. Use 'Heatmap View' for a GitHub-style activity grid.",
      "4. Click any date cell to quickly navigate to that day's journal entry."
    ]
  },

  // FEATURES
  {
    id: "features-habit-reminders",
    category: "FEATURES",
    title: "How habit reminders work",
    summary: "Automatic daily notifications for uncompleted habits.",
    content: [
      "DayNest automatically checks your active habits each day.",
      "If a habit is not completed for today, DayNest generates a daily reminder notification.",
      "Reminders are only generated once per habit per day to prevent duplicate spam.",
      "You can toggle habit reminder settings in your Settings page."
    ]
  },
  {
    id: "features-notifications",
    category: "FEATURES",
    title: "How notifications work",
    summary: "Understanding the notification bell, unread badge, and browser alerts.",
    content: [
      "Click the Bell icon in the top navigation bar to open your Notification Panel.",
      "The red dot indicates unread notifications created from real database events.",
      "Click 'Mark all as read' to clear unread notifications.",
      "If browser notification permissions are granted, native desktop notifications will pop up."
    ]
  },
  {
    id: "features-yearly-calendar",
    category: "FEATURES",
    title: "How to use the yearly calendar",
    summary: "Overview of the 12-month visual grid.",
    content: [
      "The 12-Month Yearly Layout displays 12 compact month cards in a 4x3 grid.",
      "Colored dots indicate your activity for each day (Journal, Habit, Mood, Media).",
      "Today's date is highlighted with a distinct border."
    ]
  },
  {
    id: "features-heatmap",
    category: "FEATURES",
    title: "How the Heatmap works",
    summary: "Visualizing year-long streak intensity.",
    content: [
      "Switch to 'Heatmap View' on the Calendar page.",
      "Each square represents one day of the year.",
      "Darker green shading indicates higher completion intensity on that day."
    ]
  },
  {
    id: "features-profile-edit",
    category: "FEATURES",
    title: "How to edit your profile",
    summary: "Updating your display name, bio, and profile photo.",
    content: [
      "1. Click your profile avatar in the top right corner and select 'Edit Profile'.",
      "2. Change your name or personal bio.",
      "3. Upload a new profile photo directly from your device.",
      "4. Click 'Save Changes'."
    ]
  },
  {
    id: "features-memories-gallery",
    category: "FEATURES",
    title: "How to use Memories",
    summary: "Browsing all your uploaded photos and videos in a unified gallery.",
    content: [
      "1. Click 'Memories' in the sidebar.",
      "2. Filter by 'All', 'Photos', or 'Videos'.",
      "3. Click any photo or video thumbnail to open full-screen preview mode."
    ]
  },

  // ACCOUNT & SETTINGS
  {
    id: "account-settings-preferences",
    category: "ACCOUNT & SETTINGS",
    title: "Profile and account management",
    summary: "Managing personal account settings.",
    content: [
      "Navigate to 'Settings' in the sidebar bottom menu to manage your preference toggles.",
      "You can update theme preferences, journal auto-save, and notification categories."
    ]
  },
  {
    id: "account-settings-theme",
    category: "ACCOUNT & SETTINGS",
    title: "Appearance settings",
    summary: "Switching between Light, Dark, and System theme modes.",
    content: [
      "Open your profile dropdown or Settings page.",
      "Toggle between Light Mode and Dark Mode.",
      "Your choice persists automatically across page reloads."
    ]
  },
  {
    id: "account-settings-notifications",
    category: "ACCOUNT & SETTINGS",
    title: "Notification preferences",
    summary: "Enabling or disabling specific notification types.",
    content: [
      "On the Settings page under 'Notification Preferences':",
      "Toggle 'Habit Reminders', 'Journal Reminders', 'Memory Reminders', or 'Mood Summaries'.",
      "Disabled categories will prevent new automated notifications for those events."
    ]
  },
  {
    id: "account-settings-logout",
    category: "ACCOUNT & SETTINGS",
    title: "Logout",
    summary: "Ending your authenticated session safely.",
    content: [
      "Click your avatar in the top-right corner or the logout icon at the bottom of the sidebar.",
      "Your session token will be cleared and you will return to the Login screen."
    ]
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = helpArticles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(q) ||
      article.summary.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q)
    );
  });

  const categories = ["GETTING STARTED", "FEATURES", "ACCOUNT & SETTINGS"];

  return (
    <section className="page help-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SUPPORT CENTER</span>
          <h1>Help & Support</h1>
          <p>Find quick answers, user guides, and feature walkthroughs.</p>
        </div>
      </div>

      {/* Search Help Articles Bar */}
      <div className="glass panel help-search-card">
        <div className="help-search-input-wrapper">
          <Search size={20} className="help-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles..."
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Categorized Help Articles Grid */}
      <div className="help-categories-grid">
        {categories.map((cat) => {
          const catArticles = filteredArticles.filter((a) => a.category === cat);
          if (catArticles.length === 0) return null;

          return (
            <div key={cat} className="glass panel help-category-card">
              <h2 className="category-title">{cat}</h2>
              <div className="articles-list">
                {catArticles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    className="article-link-btn"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="article-info">
                      <strong>{article.title}</strong>
                      <small>{article.summary}</small>
                    </div>
                    <ChevronRight size={16} className="chevron" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="glass panel empty-help-state">
            <Info size={36} opacity={0.5} />
            <h3>No articles found matching "{searchQuery}"</h3>
            <p>Try searching for keywords like "habits", "journal", "calendar", or "notifications".</p>
          </div>
        )}
      </div>

      {/* Support Contact Section */}
      <div className="glass panel help-contact-card">
        <div className="contact-head">
          <MessageSquare size={20} />
          <div>
            <h3>Still need help?</h3>
            <p>Contact Support & Report a Problem</p>
          </div>
        </div>
        <div className="support-status-notice">
          <AlertCircle size={16} />
          <span>Support contact has not been configured yet.</span>
        </div>
      </div>

      {/* Article Detail Modal / Panel */}
      {selectedArticle && (
        <div className="help-modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div
            className="glass help-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={selectedArticle.title}
          >
            <div className="help-modal-header">
              <span className="eyebrow">{selectedArticle.category}</span>
              <h2>{selectedArticle.title}</h2>
              <button
                className="icon-button close-modal-btn"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="help-modal-body">
              <p className="article-summary-text">{selectedArticle.summary}</p>
              <div className="article-steps-list">
                {selectedArticle.content.map((step, idx) => (
                  <p key={idx} className="step-paragraph">
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
