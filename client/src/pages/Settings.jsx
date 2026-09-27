import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun, Moon, Monitor, Bell, BookOpen, CheckSquare, Image as ImageIcon,
  BarChart2, ShieldCheck, User, LogOut, ArrowRight, Save, Check
} from "lucide-react";
import { api, getMediaUrl } from "../App.jsx";

export default function Settings({
  user,
  onUpdateUser,
  themeMode,
  onChangeThemeMode,
  onLogout
}) {
  const navigate = useNavigate();

  // Load preferences from user.settings or defaults
  const userSettings = user?.settings || {};
  const [notifPrefs, setNotifPrefs] = useState({
    journalReminders: userSettings.notifications?.journalReminders ?? true,
    habitReminders: userSettings.notifications?.habitReminders ?? true,
    memoryReminders: userSettings.notifications?.memoryReminders ?? true,
    moodSummaries: userSettings.notifications?.moodSummaries ?? true
  });

  const [journalAutoSave, setJournalAutoSave] = useState(
    userSettings.journal?.autoSave ?? false
  );

  const [saveStatus, setSaveStatus] = useState("");

  const saveSettings = async (updatedNotif, updatedAutoSave) => {
    setSaveStatus("Saving...");
    const newSettings = {
      theme: themeMode,
      notifications: updatedNotif,
      journal: { autoSave: updatedAutoSave }
    };

    try {
      const res = await api.put("/settings", { settings: newSettings });
      if (res.data && onUpdateUser) {
        onUpdateUser(res.data);
      }
      setSaveStatus("Settings saved successfully.");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveStatus("Failed to save settings.");
    }
  };

  const handleToggleNotif = (key) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    saveSettings(next, journalAutoSave);
  };

  const handleToggleAutoSave = () => {
    const next = !journalAutoSave;
    setJournalAutoSave(next);
    saveSettings(notifPrefs, next);
  };

  return (
    <section className="page settings-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PERSONAL SPACE</span>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your DayNest preferences.</p>
        </div>
        {saveStatus && (
          <div className="settings-status-toast glass">
            <Check size={14} />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      <div className="settings-cards-grid">
        {/* SECTION 1: APPEARANCE */}
        <div className="glass panel settings-section-card">
          <div className="section-card-header">
            <Sun size={18} className="section-icon" />
            <div>
              <h2>Appearance & Atmosphere</h2>
              <p>Customize the visual theme and background atmosphere.</p>
            </div>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <strong>Theme Preference</strong>
              <small>Select Light, Dark, or follow your System default.</small>
            </div>
            <div className="segmented-theme-control glass">
              <button
                type="button"
                className={`segmented-btn ${themeMode === "light" ? "active" : ""}`}
                onClick={() => onChangeThemeMode("light")}
              >
                <Sun size={14} />
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`segmented-btn ${themeMode === "dark" ? "active" : ""}`}
                onClick={() => onChangeThemeMode("dark")}
              >
                <Moon size={14} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                className={`segmented-btn ${themeMode === "system" ? "active" : ""}`}
                onClick={() => onChangeThemeMode("system")}
              >
                <Monitor size={14} />
                <span>System</span>
              </button>
            </div>
          </div>

          <div className="setting-control-row bg-preview-row">
            <div className="control-label-group">
              <strong>Background Atmosphere</strong>
              <small>The mountain atmosphere is the core visual identity of DayNest.</small>
            </div>
            <div className="bg-preview-card glass">
              <img
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80"
                alt="Mountain background preview"
                className="bg-preview-thumb"
              />
              <div className="bg-preview-info">
                <strong>Mountain — DayNest Default</strong>
                <span className="pill glass">Default</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS */}
        <div className="glass panel settings-section-card">
          <div className="section-card-header">
            <Bell size={18} className="section-icon" />
            <div>
              <h2>Notification Reminders</h2>
              <p>Choose which reminders you want to receive.</p>
            </div>
          </div>

          <div className="toggles-list">
            <div className="toggle-row">
              <div className="toggle-label-group">
                <div className="toggle-title-with-icon">
                  <BookOpen size={16} className="item-icon journal-icon" />
                  <strong>Daily Journal Reminders</strong>
                </div>
                <small>Receive prompts to record your thoughts and reflections.</small>
              </div>
              <button
                type="button"
                className={`daynest-switch ${notifPrefs.journalReminders ? "checked" : ""}`}
                onClick={() => handleToggleNotif("journalReminders")}
                role="switch"
                aria-checked={notifPrefs.journalReminders}
                aria-label="Daily Journal Reminders"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-label-group">
                <div className="toggle-title-with-icon">
                  <CheckSquare size={16} className="item-icon habit-icon" />
                  <strong>Habit Reminders</strong>
                </div>
                <small>Get notified about your daily active habits and streaks.</small>
              </div>
              <button
                type="button"
                className={`daynest-switch ${notifPrefs.habitReminders ? "checked" : ""}`}
                onClick={() => handleToggleNotif("habitReminders")}
                role="switch"
                aria-checked={notifPrefs.habitReminders}
                aria-label="Habit Reminders"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-label-group">
                <div className="toggle-title-with-icon">
                  <ImageIcon size={16} className="item-icon memory-icon" />
                  <strong>Memory Reminders</strong>
                </div>
                <small>Nostalgic highlights looking back on previous memories.</small>
              </div>
              <button
                type="button"
                className={`daynest-switch ${notifPrefs.memoryReminders ? "checked" : ""}`}
                onClick={() => handleToggleNotif("memoryReminders")}
                role="switch"
                aria-checked={notifPrefs.memoryReminders}
                aria-label="Memory Reminders"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-label-group">
                <div className="toggle-title-with-icon">
                  <BarChart2 size={16} className="item-icon mood-icon" />
                  <strong>Weekly Mood Summaries</strong>
                </div>
                <small>Weekly overview and analysis of your mood trends.</small>
              </div>
              <button
                type="button"
                className={`daynest-switch ${notifPrefs.moodSummaries ? "checked" : ""}`}
                onClick={() => handleToggleNotif("moodSummaries")}
                role="switch"
                aria-checked={notifPrefs.moodSummaries}
                aria-label="Weekly Mood Summaries"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: JOURNAL PREFERENCES */}
        <div className="glass panel settings-section-card">
          <div className="section-card-header">
            <BookOpen size={18} className="section-icon" />
            <div>
              <h2>Journal Preferences</h2>
              <p>Configure writing workflow and auto-save options.</p>
            </div>
          </div>

          <div className="toggles-list">
            <div className="toggle-row">
              <div className="toggle-label-group">
                <strong>Journal Auto-Save</strong>
                <small>Automatically save journal entries as you write without needing to manually click Save.</small>
              </div>
              <button
                type="button"
                className={`daynest-switch ${journalAutoSave ? "checked" : ""}`}
                onClick={handleToggleAutoSave}
                role="switch"
                aria-checked={journalAutoSave}
                aria-label="Journal Auto-Save"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: PRIVACY & ACCOUNT */}
        <div className="glass panel settings-section-card">
          <div className="section-card-header">
            <ShieldCheck size={18} className="section-icon" />
            <div>
              <h2>Privacy & Account</h2>
              <p>Manage profile, account security, and session.</p>
            </div>
          </div>

          <div className="account-actions-list">
            <div className="account-action-row" onClick={() => navigate("/edit-profile")}>
              <div className="action-row-left">
                <User size={16} className="action-icon" />
                <div>
                  <strong>Edit Profile</strong>
                  <small>Update name, bio, and profile photo.</small>
                </div>
              </div>
              <ArrowRight size={15} className="arrow-icon" />
            </div>

            <div className="account-action-row">
              <div className="action-row-left">
                <ShieldCheck size={16} className="action-icon" />
                <div>
                  <strong>Privacy & Data Protection</strong>
                  <small>Your journal entries and memories are private and encrypted for your account.</small>
                </div>
              </div>
              <span className="pill glass">Encrypted</span>
            </div>

            <div className="account-action-row danger-action-row" onClick={onLogout}>
              <div className="action-row-left">
                <LogOut size={16} className="action-icon danger-icon" />
                <div>
                  <strong className="danger-text">Logout</strong>
                  <small>Sign out of your DayNest session safely.</small>
                </div>
              </div>
              <ArrowRight size={15} className="arrow-icon danger-icon" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
